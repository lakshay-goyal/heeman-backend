export const contactConstants = {
    header: {
        subtitle: "Get In Touch",
        titleLine1: "We're here to help",
        titleLine2: "curate your dream.",
        description: "Whether you have a question about our bespoke services, material sourcing, or an existing order, our team is ready to assist you."
    },
    form: {
        fields: {
            fullName: { label: "Full Name", placeholder: "John Doe" },
            email: { label: "Email Address", placeholder: "john@example.com" },
            subject: {
                label: "Subject",
                options: [
                    "General Inquiry",
                    "Interior Consultation",
                    "Bespoke Commission",
                    "Order Support",
                    "Press & Media"
                ]
            },
            message: { label: "Your Message", placeholder: "How can we help?" }
        },
        buttonText: "Send Message"
    },
    details: {
        studios: {
            title: "Our Studios",
            locations: [
                {
                    city: "Bangalore Flagship",
                    addressLine1: "123 Indiranagar, 12th Main",
                    addressLine2: "Bangalore, KA 560038"
                },
                {
                    city: "Mumbai Atelier",
                    addressLine1: "Artisans' Quarter, 45 Worli",
                    addressLine2: "Mumbai, MH 400018"
                }
            ]
        },
        communication: {
            title: "Direct Communication",
            email: "hello@heeman.com",
            phone: "+91 80 4567 8900",
            phoneLink: "+918045678900"
        },
        social: {
            title: "Connect Digitally"
        }
    },
    mapImage: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=2000"
};
