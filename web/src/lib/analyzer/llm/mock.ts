import { extractFomo } from "../fomo";
import { extractPrice, pickPrice, priceTier } from "../price";
import { detectTerms } from "../glossary";
import { suggestAlternatives } from "../alternatives";
import { buildGap } from "../gap";
import { extractKeywords } from "../keywords";
import { detectFomoKeywords } from "../fomoKeywords";
import type { LlmProvider } from "./types";

export const mockProvider: LlmProvider = {
  name: "mock",
  async analyze(input) {
    const fomo = extractFomo(input.title ?? "", input.description ?? "", input.primaryText);
    const priceFromText = extractPrice(input.fullText);
    const price = pickPrice(input.jsonLd.priceKrw, priceFromText);
    const tier = priceTier(price.amountKrw);
    const terms = detectTerms(input.primaryText);
    const alternatives = suggestAlternatives(input.title, terms);
    const gap = buildGap(input.marketingClaims, input.curriculumItems);
    const keywords = extractKeywords({
      title: input.title,
      description: input.description,
      marketingClaims: input.marketingClaims,
      curriculumItems: input.curriculumItems,
    });
    const fomoKeywords = detectFomoKeywords(
      input.title,
      input.description,
      input.primaryText,
      ...input.marketingClaims,
    );
    return { keywords, gap, fomo, fomoKeywords, price, tier, terms, alternatives };
  },
};
