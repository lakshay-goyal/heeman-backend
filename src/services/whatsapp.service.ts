import { ENV } from "../config/env.config";
import { prisma } from "../lib/prisma";
import { cleanPhone } from "./verificationToken.service";

const statusMap: Record<string, "SENT" | "DELIVERED" | "READ" | "FAILED"> = {
    sent: "SENT",
    delivered: "DELIVERED",
    read: "READ",
    failed: "FAILED",
};

const hasWhatsAppConfig = () => Boolean(ENV.WHATSAPP_ACCESS_TOKEN && ENV.WHATSAPP_PHONE_NUMBER_ID);

export const sendWhatsAppTemplateForEnquiry = async (enquiryId: string) => {
    const enquiry = await prisma.productEnquiry.findUnique({
        where: { id: enquiryId },
        include: { items: true },
    });

    if (!enquiry) {
        throw new Error("Enquiry not found.");
    }

    if (!enquiry.whatsappConsent) {
        throw new Error("WhatsApp consent is required before sending a template.");
    }

    if (!hasWhatsAppConfig()) {
        await prisma.productEnquiry.update({
            where: { id: enquiry.id },
            data: { whatsappStatus: "QUEUED" },
        });
        return {
            configured: false,
            message: "WhatsApp Cloud API credentials are not configured. Template send is queued.",
        };
    }

    const to = cleanPhone(enquiry.phone);
    const response = await fetch(
        `https://graph.facebook.com/${ENV.WHATSAPP_GRAPH_API_VERSION}/${ENV.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${ENV.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to,
                type: "template",
                template: {
                    name: ENV.WHATSAPP_TEMPLATE_NAME,
                    language: { code: ENV.WHATSAPP_TEMPLATE_LANGUAGE },
                },
            }),
        }
    );

    const data = await response.json() as any;

    if (!response.ok) {
        await prisma.productEnquiry.update({
            where: { id: enquiry.id },
            data: { whatsappStatus: "FAILED" },
        });
        await prisma.whatsAppMessage.create({
            data: {
                enquiryId: enquiry.id,
                phone: to,
                direction: "STATUS",
                status: "FAILED",
                raw: data,
            },
        });
        throw new Error(data?.error?.message || "WhatsApp template send failed.");
    }

    const providerMessageId = data?.messages?.[0]?.id as string | undefined;

    await prisma.productEnquiry.update({
        where: { id: enquiry.id },
        data: {
            status: "WHATSAPP_SENT",
            whatsappStatus: "SENT",
        },
    });

    await prisma.whatsAppMessage.create({
        data: {
            enquiryId: enquiry.id,
            providerMessageId,
            phone: to,
            direction: "OUTBOUND",
            status: "SENT",
            body: ENV.WHATSAPP_TEMPLATE_NAME,
            raw: data,
        },
    });

    return {
        configured: true,
        providerMessageId,
        response: data,
    };
};

export const handleWhatsAppWebhookPayload = async (payload: any) => {
    const changes = payload?.entry?.flatMap((entry: any) => entry?.changes || []) || [];
    const handled: Array<{ type: string; id?: string; status?: string }> = [];

    for (const change of changes) {
        const value = change?.value;
        const statuses = value?.statuses || [];
        const messages = value?.messages || [];

        for (const status of statuses) {
            const providerMessageId = status.id as string | undefined;
            const mappedStatus = statusMap[status.status] || "FAILED";
            const message = providerMessageId
                ? await prisma.whatsAppMessage.findUnique({ where: { providerMessageId } })
                : null;

            if (message?.enquiryId) {
                await prisma.productEnquiry.update({
                    where: { id: message.enquiryId },
                    data: { whatsappStatus: mappedStatus },
                });
            }

            await prisma.whatsAppMessage.create({
                data: {
                    enquiryId: message?.enquiryId || null,
                    phone: cleanPhone(status.recipient_id || message?.phone || ""),
                    direction: "STATUS",
                    status: mappedStatus,
                    raw: status,
                },
            });

            handled.push({ type: "status", id: providerMessageId, status: mappedStatus });
        }

        for (const message of messages) {
            const from = cleanPhone(message.from || "");
            const body = message.text?.body || message.button?.text || message.interactive?.button_reply?.title || "";
            const enquiry = await prisma.productEnquiry.findFirst({
                where: { phone: from },
                orderBy: { createdAt: "desc" },
            });

            if (enquiry) {
                await prisma.productEnquiry.update({
                    where: { id: enquiry.id },
                    data: {
                        status: "REPLIED",
                        whatsappStatus: "REPLIED",
                    },
                });
            }

            await prisma.whatsAppMessage.create({
                data: {
                    enquiryId: enquiry?.id || null,
                    providerMessageId: message.id,
                    phone: from,
                    direction: "INBOUND",
                    status: "REPLIED",
                    body,
                    raw: message,
                },
            });

            handled.push({ type: "message", id: message.id, status: "REPLIED" });
        }
    }

    return handled;
};
