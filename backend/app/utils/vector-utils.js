/**
 * Calculates the dot product of two vectors.
 * @param {number[]} v1 
 * @param {number[]} v2 
 * @returns {number}
 */
export function dotProduct(v1, v2) {
    if (!v1 || !v2 || v1.length !== v2.length) return 0;
    return v1.reduce((acc, current, i) => acc + current * v2[i], 0);
}

/**
 * Calculates the magnitude (norm) of a vector.
 * @param {number[]} v 
 * @returns {number}
 */
export function magnitude(v) {
    if (!v) return 0;
    return Math.sqrt(v.reduce((acc, val) => acc + val * val, 0));
}

/**
 * Calculates the cosine similarity between two vectors.
 * @param {number[]} v1 
 * @param {number[]} v2 
 * @returns {number}
 */
export function cosineSimilarity(v1, v2) {
    const dot = dotProduct(v1, v2);
    const mag1 = magnitude(v1);
    const mag2 = magnitude(v2);
    if (mag1 === 0 || mag2 === 0) return 0;
    return dot / (mag1 * mag2);
}

/**
 * Calculates an aggregate vector (mean) from multiple vectors.
 * @param {number[][]} vectors 
 * @returns {number[]}
 */
export function getAggregateVector(vectors) {
    if (!vectors || vectors.length === 0) return [];
    if (vectors.length === 1) return vectors[0];

    const dimensions = vectors[0].length;
    const result = new Array(dimensions).fill(0);

    for (const vector of vectors) {
        for (let i = 0; i < dimensions; i++) {
            result[i] += vector[i] || 0;
        }
    }

    return result.map(val => val / vectors.length);
}
