const axios = require("axios");

// Compute Jaccard similarity between two skill arrays as fallback
const jaccardSimilarity = (skillsA, skillsB) => {
  const a = new Set(skillsA.map((s) => s.toLowerCase()));
  const b = new Set(skillsB.map((s) => s.toLowerCase()));
  const intersection = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
};

// HuggingFace sentence similarity (optional — falls back to Jaccard if key missing)
const getEmbedding = async (text) => {
  if (!process.env.HUGGINGFACE_API_KEY) return null;
  try {
    const { data } = await axios.post(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
      { inputs: text },
      { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` } }
    );
    return data[0];
  } catch {
    return null;
  }
};

const cosineSimilarity = (a, b) => {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return magA && magB ? dot / (magA * magB) : 0;
};

/**
 * Score and rank freelancers against a gig's required skills
 * @param {string[]} gigSkills
 * @param {Array<{userId, skills: string[], rating: number}>} freelancers
 * @returns sorted freelancers with matchScore
 */
const rankFreelancers = async (gigSkills, freelancers) => {
  const gigText = gigSkills.join(", ");
  const gigEmbedding = await getEmbedding(gigText);

  const scored = await Promise.all(
    freelancers.map(async (f) => {
      const freelancerSkills = (f.skills || []).map((s) => s.name || s);
      let simScore;

      if (gigEmbedding) {
        const fEmbedding = await getEmbedding(freelancerSkills.join(", "));
        simScore = fEmbedding ? cosineSimilarity(gigEmbedding, fEmbedding) : jaccardSimilarity(gigSkills, freelancerSkills);
      } else {
        simScore = jaccardSimilarity(gigSkills, freelancerSkills);
      }

      const ratingScore = ((f.reputationScore || f.rating || 0) / 5) * 0.3;
      const matchScore = Math.round((simScore * 0.7 + ratingScore) * 100);
      return { ...f, matchScore };
    })
  );

  return scored.sort((a, b) => b.matchScore - a.matchScore);
};

module.exports = { rankFreelancers };
