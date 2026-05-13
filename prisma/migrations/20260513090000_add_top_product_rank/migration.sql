ALTER TABLE "Product" ADD COLUMN "topProductRank" INTEGER;

CREATE INDEX "Product_isTopProduct_topProductRank_idx" ON "Product"("isTopProduct", "topProductRank");
