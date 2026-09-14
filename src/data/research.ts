import type { ResearchArticle } from '@/types'

export const researchArticles: ResearchArticle[] = [
  {
    id: '1',
    slug: 'aether-compute-verification-model',
    title: 'Inside Aether Protocol: Verifying Decentralized Compute at Scale',
    summary:
      'A deep dive into Aether\'s TEE-based execution proofs, provider reputation system, and the economics of decentralized GPU markets.',
    content: `
## Executive Summary

Aether Protocol has emerged as a leading decentralized compute marketplace, coordinating GPU resources across multiple chains with verifiable execution guarantees. This Echo-Intel report examines the protocol's architecture, verification model, and competitive positioning.

## Verification Architecture

Aether uses Trusted Execution Environment (TEE) attestation combined with on-chain settlement to create a trust-minimized compute marketplace. Each job submission includes:

- **Input hash verification** — Ensures data integrity before execution
- **TEE attestation** — Cryptographic proof that computation ran in a verified enclave
- **Output hash matching** — Confirms results match expected outputs

## Provider Economics

The network currently supports 847 active GPU providers with a median job completion time of 4.2 minutes for standard inference workloads. Provider staking requirements and slashing conditions create strong incentives for honest behavior.

## Risk Factors

While the verification model is robust, provider concentration remains a concern with the top 5 providers handling 62% of network compute. The team has announced plans for geographic and hardware diversity incentives in Q2 2026.

## Conclusion

Aether represents a mature approach to decentralized compute with strong technical foundations. EchoCheck status: **Verified**.
    `,
    author: 'Sarah Mitchell',
    authorId: '1',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    date: '2026-01-28',
    readTime: 12,
    category: 'echo-intel',
    topic: 'Infrastructure',
    ecosystem: 'Ethereum',
    status: 'published',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    projectId: '1',
  },
  {
    id: '2',
    slug: 'defi-yield-transparency-framework',
    title: 'The State of DeFi Yield Transparency in 2026',
    summary:
      'An ecosystem analysis of yield product disclosure standards, comparing Vertex Vaults, Yearn, and emerging transparent vault protocols.',
    content: `
## Overview

As DeFi yield products mature, transparency has become a critical differentiator. This analysis compares disclosure practices across major vault protocols.

## Key Findings

1. Only 34% of yield products publish real-time risk scores
2. Historical performance data is often incomplete or unaudited
3. Vertex Vaults leads in on-chain risk attribution transparency

## Recommendations

Protocols should adopt standardized risk disclosure frameworks similar to traditional finance fact sheets.
    `,
    author: 'James Okonkwo',
    authorId: '2',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
    date: '2026-02-03',
    readTime: 8,
    category: 'ecosystem-analysis',
    topic: 'DeFi',
    ecosystem: 'Multi-chain',
    status: 'published',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938e0e?w=800&q=80',
    projectId: '2',
  },
  {
    id: '3',
    slug: 'sentinel-founder-interview',
    title: 'Founder Interview: Building Trust in On-Chain Security',
    summary:
      'EchoSpot sits down with Sentinel Guardian\'s CEO to discuss the future of automated security monitoring and incident response.',
    content: `
## Interview

**EchoSpot:** What motivated you to build Sentinel Guardian?

**CEO:** After witnessing three major DeFi exploits in 2024, we realized the industry needed proactive, automated security infrastructure — not just post-mortem audits.

**EchoSpot:** How does EchoCheck verification align with your product philosophy?

**CEO:** Transparency is everything in security. We publish our detection methodologies, false positive rates, and response times publicly. EchoCheck validates what we claim.
    `,
    author: 'Sarah Mitchell',
    authorId: '1',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    date: '2026-01-15',
    readTime: 6,
    category: 'founder-interview',
    topic: 'Security',
    ecosystem: 'Multi-chain',
    status: 'published',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
    projectId: '4',
  },
  {
    id: '4',
    slug: 'oracle-manipulation-landscape',
    title: 'Oracle Manipulation: A Narrative Breakdown',
    summary:
      'Tracing the evolution of oracle attacks from 2020 to 2026 and how protocols like Peak Oracle are building manipulation-resistant feeds.',
    content: `
## Historical Context

Oracle manipulation has caused over $1.2B in losses across DeFi. This narrative breakdown traces attack vectors and defensive innovations.

## Attack Vectors

- Flash loan price manipulation
- Low-liquidity pool exploitation
- Cross-chain latency arbitrage

## Modern Defenses

Peak Oracle's sub-second finality and multi-source aggregation represent the current state of the art in manipulation resistance.
    `,
    author: 'Alex Rivera',
    authorId: '3',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    date: '2026-01-20',
    readTime: 10,
    category: 'narrative-breakdown',
    topic: 'Oracle',
    ecosystem: 'Ethereum',
    status: 'published',
    image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=80',
    projectId: '5',
  },
  {
    id: '5',
    slug: 'depin-connectivity-primer',
    title: 'DePIN Connectivity: An Educational Research Primer',
    summary:
      'A beginner-friendly guide to decentralized physical infrastructure networks, covering tokenomics, hardware requirements, and regulatory considerations.',
    content: `
## What is DePIN?

Decentralized Physical Infrastructure Networks (DePIN) coordinate real-world hardware through blockchain incentives.

## Key Concepts

- Proof of Coverage
- Bandwidth tokenization
- Device attestation

## Projects to Watch

Global Mesh, Helium, and Filecoin represent different approaches to decentralized infrastructure.
    `,
    author: 'James Okonkwo',
    authorId: '2',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
    date: '2026-02-08',
    readTime: 15,
    category: 'educational-research',
    topic: 'DePIN',
    ecosystem: 'Multi-chain',
    status: 'published',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    projectId: '6',
  },
  {
    id: '6',
    slug: 'nova-compute-spotlight',
    title: 'Project Spotlight: Nova Compute Edge Network',
    summary:
      'Early analysis of Nova Compute\'s edge inference architecture and testnet performance metrics.',
    content: `
## Spotlight

Nova Compute is building an edge inference network targeting sub-100ms latency for AI-powered dApps. Currently in testnet with 120 active nodes.

## Early Observations

- Promising latency benchmarks
- Limited documentation
- Team credentials partially verified

EchoCheck status: **Needs Review**
    `,
    author: 'Alex Rivera',
    authorId: '3',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    date: '2026-02-12',
    readTime: 7,
    category: 'project-spotlight',
    topic: 'AI',
    ecosystem: 'Solana',
    status: 'published',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    projectId: '3',
  },
]

export function getResearchBySlug(slug: string): ResearchArticle | undefined {
  return researchArticles.find((a) => a.slug === slug)
}

export const researchTypeLabels: Record<string, string> = {
  'echo-intel': 'Echo-Intel',
  'project-spotlight': 'Project Spotlight',
  'founder-interview': 'Founder Interview',
  'narrative-breakdown': 'Narrative Breakdown',
  'ecosystem-analysis': 'Ecosystem Analysis',
  'educational-research': 'Educational Research',
}
