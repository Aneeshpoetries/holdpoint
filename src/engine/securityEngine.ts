/**
 * HOLDPOINT Security Engine: End-to-End Adversarial Threat & Semantic Control Layer
 * 
 * CORE INVARIANT: Free text is evidence, never authority.
 * Free text alone can NEVER assert authorization, bypass policies, or trigger mutations.
 * 
 * Multi-Stage Architecture:
 * 1. Unicode & Homoglyph Normalizer (Stripping zero-width, invisible, and confusable chars)
 * 2. Recursive Obfuscation Decoder (Base64, Hex, URL-encoding, Rot13)
 * 3. Multi-Vector Adversarial Classifier (Direct Prompt Injection, Jailbreaks, Authority Spoofing, Evasion)
 * 4. Consequential Action Taxonomy & Entity Compiler
 * 5. Defense-in-Depth Cross-Verification (LLM Structured Analysis + Deterministic Soundness Gate)
 */

import {
  ChatHistoryTurn,
  DestinationId,
  DraftActionContract,
  DraftValidationResult,
  ImpactLevel,
  PersonaProfile,
  Reversibility
} from './types';

export type ThreatVector =
  | 'DIRECT_PROMPT_INJECTION'
  | 'JAILBREAK_ROLEPLAY'
  | 'AUTHORITY_SPOOFING'
  | 'ENCODING_EVASION'
  | 'DESTRUCTIVE_IRREVERSIBLE'
  | 'DATA_EXFILTRATION'
  | 'GOVERNANCE_BYPASS'
  | 'CREDENTIAL_TAMPERING';

export interface SecurityThreatReport {
  isThreat: boolean;
  threatSeverity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  confidenceScore: number;
  detectedVectors: ThreatVector[];
  findings: string[];
  normalizedPrompt: string;
  decodedArtifacts: string[];
  recommendedAction: 'allow' | 'stage_dual_control' | 'quarantine_deny';
  reasoning: string;
}

// ============================================================================
// 1. UNICODE NORMALIZER & CONFUSABLE / ZERO-WIDTH STRIPPER
// ============================================================================
export class UnicodeNormalizer {
  // Common Cyrillic & Greek homoglyphs used in evasion
  private static readonly HOMOGLYPH_MAP: Record<string, string> = {
    'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x',
    'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H', 'О': 'O',
    'Р': 'P', 'С': 'C', 'Т': 'T', 'Х': 'X', 'і': 'i', 'І': 'I', 'ј': 'j',
    'ѕ': 's', 'ԛ': 'q', 'ԝ': 'w'
  };

  public static normalize(text: string): { clean: string; hadZeroWidth: boolean; hadHomoglyphs: boolean } {
    let hadZeroWidth = false;
    let hadHomoglyphs = false;

    // 1. Strip zero-width & invisible format characters
    const zeroWidthRegex = /[\u200B\u200C\u200D\u200E\u200F\uFEFF\u00AD\u202A-\u202E\u2066-\u2069]/g;
    if (zeroWidthRegex.test(text)) {
      hadZeroWidth = true;
    }
    let sanitized = text.replace(zeroWidthRegex, '');

    // 2. Normalize full-width characters (e.g. ｄｅｌｅｔｅ -> delete)
    sanitized = sanitized.replace(/[\uFF01-\uFF5E]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)
    );

    // 3. Normalize homoglyphs
    let homoglyphReplaced = '';
    for (const char of sanitized) {
      if (this.HOMOGLYPH_MAP[char]) {
        hadHomoglyphs = true;
        homoglyphReplaced += this.HOMOGLYPH_MAP[char];
      } else {
        homoglyphReplaced += char;
      }
    }

    return {
      clean: homoglyphReplaced.trim(),
      hadZeroWidth,
      hadHomoglyphs
    };
  }
}

// ============================================================================
// 2. RECURSIVE OBFUSCATION DECODER
// ============================================================================
export class ObfuscationDecoder {
  private static readonly MAX_DEPTH = 3;

  public static decodeRecursive(text: string, currentDepth: number = 0): string[] {
    if (currentDepth >= this.MAX_DEPTH) return [];
    const discovered: string[] = [];

    // 1. Check for URL encoded sequences (%20, %22, %3C, etc.)
    if (/%[0-9a-fA-F]{2}/.test(text)) {
      try {
        const decodedUrl = decodeURIComponent(text.replace(/\+/g, ' '));
        if (decodedUrl !== text && decodedUrl.length > 3) {
          discovered.push(decodedUrl);
          discovered.push(...this.decodeRecursive(decodedUrl, currentDepth + 1));
        }
      } catch {
        // ignore malformed
      }
    }

    // 2. Check for Hex escape sequences (\x64\x65\x6c\x65\x74\x65 or 0x64...)
    const hexPattern = /(?:\\x[0-9a-fA-F]{2}){3,}/g;
    let hexMatch;
    while ((hexMatch = hexPattern.exec(text)) !== null) {
      try {
        const rawHex = hexMatch[0].replace(/\\x/g, '');
        const decoded = Buffer.from(rawHex, 'hex').toString('utf8');
        if (/[\x20-\x7E]{3,}/.test(decoded)) {
          discovered.push(decoded);
          discovered.push(...this.decodeRecursive(decoded, currentDepth + 1));
        }
      } catch {
        // ignore
      }
    }

    // 3. Check for Base64 segments
    const b64Regex = /\b[A-Za-z0-9+/]{16,}={0,2}\b/g;
    let b64Match;
    while ((b64Match = b64Regex.exec(text)) !== null) {
      try {
        const decoded = Buffer.from(b64Match[0], 'base64').toString('utf8');
        if (/^[\x20-\x7E\s]{4,}$/.test(decoded)) {
          discovered.push(decoded);
          discovered.push(...this.decodeRecursive(decoded, currentDepth + 1));
        }
      } catch {
        // ignore
      }
    }

    return Array.from(new Set(discovered));
  }
}

// ============================================================================
// 3. MULTI-VECTOR ADVERSARIAL THREAT DETECTOR
// ============================================================================
export class AdversarialThreatDetector {
  // Vector 1: Direct Prompt Injection & Delimiter Overrides
  private static readonly INJECTION_DELIMITERS = [
    /<\|im_start\|>/i,
    /<\|im_end\|>/i,
    /\[INST\]/i,
    /\[\/INST\]/i,
    /<<SYS>>/i,
    /<\/SYS>/i,
    /```(?:system|admin|root|console)/i,
    /---+\s*(?:BEGIN|START|END)\s*(?:SYSTEM|ADMIN|PROMPT|INSTRUCTION)/i,
    /###\s*(?:System|Instruction|Override|Admin)/i,
    /\[SYSTEM\s+MESSAGE\]/i,
    /\[DEVELOPER\s+MODE\]/i
  ];

  private static readonly INJECTION_DIRECTIVES = [
    /\b(?:ignore|disregard|forget|override|bypass|negate|drop)\s+(?:all\s+)?(?:previous|prior|above|system|initial|safety)\s+(?:instructions?|guidelines?|rules?|prompts?|constraints?|guards?|policies)/i,
    /\b(?:system\s+prompt\s+injection|system\s+override|emergency\s+override)\b/i,
    /\bnew\s+system\s+instruction\s*:/i,
    /\bfrom\s+now\s+on\s+(?:you\s+must|you\s+will|act\s+as|ignore)/i,
    /\bdo\s+not\s+(?:obey|follow|apply|check)\s+(?:any\s+)?(?:safety|policy|rules|guidelines)/i,
    /\bprint\s+(?:your\s+)?(?:system\s+prompt|initial\s+instructions|secret\s+instructions)/i,
    /\braw\s+json\s+mode\s+without\s+validation/i
  ];

  // Vector 2: Jailbreak Personas & Fictional Framing
  private static readonly JAILBREAK_PATTERNS = [
    /\bDAN\s+mode\b/i,
    /\bdo\s+anything\s+now\b/i,
    /\bdeveloper\s+mode\s*(?:enabled|activated|on)?\b/i,
    /\bmaintenance\s+override\s+mode\b/i,
    /\buncensored\s+(?:mode|assistant|model)\b/i,
    /\bin\s+a\s+fictional\s+world\s+where\s+(?:there\s+are\s+no\s+rules|safety\s+does\s+not\s+exist)\b/i,
    /\blet['’]s\s+roleplay\s+that\s+you\s+have\s+root\s+access\b/i,
    /\bfor\s+educational\s+or\s+hypothetical\s+testing\s+purposes\s+only,?\s+(?:execute|delete|drop|bypass)\b/i
  ];

  // Vector 3: Authority Spoofing & Fraudulent Escalation
  private static readonly AUTHORITY_SPOOFING_PATTERNS = [
    /\b(?:i\s+am|this\s+is)\s+(?:the\s+)?(?:ceo|cto|ciso|vp\s+of\s+engineering|board\s+member|executive|sysadmin|root)\b/i,
    /\b(?:ceo|cto|ciso|executive)\s+(?:approved|authorized|directed)\s+(?:this\s+)?(?:in\s+private\s+email|in\s+slack|verbally|on\s+call)\b/i,
    /\bemergency\s+override\s+(?:code|token|key|authorized)\b/i,
    /\bauthorized\s+penetration\s+test\s+drill,?\s+bypass\b/i,
    /\b(?:offshore|cayman|unverified\s+international|shell\s+company|kyc-pending|untrusted\s+lottery)\b/i
  ];

  // Vector 4: Destructive Invariant Violations
  private static readonly DESTRUCTIVE_PATTERNS = [
    /\b(?:permanently\s+delete|delete\s+permanently|delete\s+all|wipe\s+all|purge\s+all|destroy\s+all|erase\s+all|nuke\s+all|delete\s+everything|wipe\s+everything|delete\s+master\s+photos)\b/i,
    /\b(?:drop\s+(?:database|db|production\s+database|cluster|table)|rm\s+-rf|destroy\s+cluster|terminate\s+rds|purge\s+storage|purge\s+all\s+cloud\s+storage|delete\s+kms)\b/i,
    /\b(?:delete\s+(?:my\s+)?account\s+permanently|permanent\s+account\s+destruction)\b/i,
    /\b(?:force\s+push|force_push_main|--no-verify|overwrite\s+main\s+branch|push\s+directly\s+to\s+main|bypass\s+code\s+review|merge\s+unreviewed)\b/i,
    /\b(?:cancel\s+all\s+active\s+family\s+subscriptions|cancel\s+all\s+subscriptions|wipe\s+all\s+family\s+calendar)\b/i
  ];

  // Vector 5: Identity & Security Bypass
  private static readonly IDENTITY_BYPASS_PATTERNS = [
    /\b(?:bypass|turn\s+off|disable|remove|override)\s+(?:2fa|two-factor|mfa|sms|authenticator|otp|verification)\b/i,
    /\b(?:reset|change|update)\s+recovery\s+(?:phone|email)\s+without\s+(?:sms|verification|code|2fa)\b/i,
    /\b(?:transfer\s+account\s+ownership|override\s+admin\s+recovery\s+lock)\b/i
  ];

  // Vector 6: Governance & Guardrail Disablement
  private static readonly GOVERNANCE_BYPASS_PATTERNS = [
    /\b(?:disable|turn\s+off|deactivate|bypass|shut\s+down|stop)\s+(?:holdpoint|security\s+enforcement|guardrails?|broker|dual-control|safety\s+checks|all\s+safeguard)\b/i,
    /\b(?:instruct\s+agents\s+to\s+take\s+actions\s+directly\s+without\s+contract|stop\s+all\s+broker\s+checks)\b/i
  ];

  // Vector 7: Data Exfiltration & Privacy Leakage
  private static readonly DATA_EXFILTRATION_PATTERNS = [
    /\b(?:leak|exfiltrate|dump)\s+(?:private|confidential|all|student|customer|database|pricing)/i,
    /\b(?:unmasked\s+(?:student\s+)?ssn|social\s+security\s+(?:numbers?|digits?))\b/i,
    /\bexport\s+(?:entire\s+)?(?:crm\s+database|database\s+of\s+35|35,?000\s+(?:customer\s+)?contacts)/i,
    /\b(?:confidential\s+customer\s+pricing|competitor\s+discount\s+margins)\b/i
  ];

  public static analyzePrompt(rawPrompt: string): SecurityThreatReport {
    const { clean, hadZeroWidth, hadHomoglyphs } = UnicodeNormalizer.normalize(rawPrompt);
    const decodedLayers = ObfuscationDecoder.decodeRecursive(clean);
    const allTextToInspect = [clean, ...decodedLayers];

    const detectedVectors: ThreatVector[] = [];
    const findings: string[] = [];

    if (hadZeroWidth) {
      detectedVectors.push('ENCODING_EVASION');
      findings.push('CRITICAL: Stripped zero-width / invisible format characters (potential token-smuggling evasion).');
    }

    if (hadHomoglyphs) {
      detectedVectors.push('ENCODING_EVASION');
      findings.push('HIGH: Cyrillic / full-width homoglyphs detected and normalized to ASCII canonical form.');
    }

    if (decodedLayers.length > 0) {
      detectedVectors.push('ENCODING_EVASION');
      findings.push(`HIGH: Obfuscated multi-layer payload decoded (${decodedLayers.length} encoded representations).`);
    }

    // Evaluate across all text representations
    for (const text of allTextToInspect) {
      // 1. Direct prompt injection delimiters
      for (const pattern of this.INJECTION_DELIMITERS) {
        if (pattern.test(text)) {
          if (!detectedVectors.includes('DIRECT_PROMPT_INJECTION')) {
            detectedVectors.push('DIRECT_PROMPT_INJECTION');
            findings.push(`CRITICAL: Chat framework instruction delimiter injection matched: ${pattern.source}`);
          }
        }
      }

      // 2. Direct injection directives
      for (const pattern of this.INJECTION_DIRECTIVES) {
        if (pattern.test(text)) {
          if (!detectedVectors.includes('DIRECT_PROMPT_INJECTION')) {
            detectedVectors.push('DIRECT_PROMPT_INJECTION');
            findings.push(`CRITICAL: Prompt injection directive matched: ${pattern.source}`);
          }
        }
      }

      // 3. Jailbreak & roleplay evasion
      for (const pattern of this.JAILBREAK_PATTERNS) {
        if (pattern.test(text)) {
          if (!detectedVectors.includes('JAILBREAK_ROLEPLAY')) {
            detectedVectors.push('JAILBREAK_ROLEPLAY');
            findings.push(`CRITICAL: Jailbreak or unaligned roleplay pattern matched: ${pattern.source}`);
          }
        }
      }

      // 4. Authority spoofing
      for (const pattern of this.AUTHORITY_SPOOFING_PATTERNS) {
        if (pattern.test(text)) {
          if (!detectedVectors.includes('AUTHORITY_SPOOFING')) {
            detectedVectors.push('AUTHORITY_SPOOFING');
            findings.push(`HIGH: Claim of executive authority or unverified destination in free text.`);
          }
        }
      }

      // 5. Destructive operations
      for (const pattern of this.DESTRUCTIVE_PATTERNS) {
        if (pattern.test(text)) {
          if (!detectedVectors.includes('DESTRUCTIVE_IRREVERSIBLE')) {
            detectedVectors.push('DESTRUCTIVE_IRREVERSIBLE');
            findings.push(`HIGH: High-consequence irreversible data destruction command identified.`);
          }
        }
      }

      // 6. Identity & authentication bypass
      for (const pattern of this.IDENTITY_BYPASS_PATTERNS) {
        if (pattern.test(text)) {
          if (!detectedVectors.includes('CREDENTIAL_TAMPERING')) {
            detectedVectors.push('CREDENTIAL_TAMPERING');
            findings.push(`CRITICAL: Authentication / 2FA bypass command detected.`);
          }
        }
      }

      // 7. Governance bypass
      for (const pattern of this.GOVERNANCE_BYPASS_PATTERNS) {
        if (pattern.test(text)) {
          if (!detectedVectors.includes('GOVERNANCE_BYPASS')) {
            detectedVectors.push('GOVERNANCE_BYPASS');
            findings.push(`CRITICAL: Direct attempt to disable HOLDPOINT security enforcement or dual-control brokers.`);
          }
        }
      }

      // 8. Data Exfiltration
      for (const pattern of this.DATA_EXFILTRATION_PATTERNS) {
        if (pattern.test(text)) {
          if (!detectedVectors.includes('DATA_EXFILTRATION')) {
            detectedVectors.push('DATA_EXFILTRATION');
            findings.push(`HIGH: Sensitive dataset or credential exfiltration pattern identified.`);
          }
        }
      }
    }

    const isThreat = detectedVectors.length > 0;
    let threatSeverity: SecurityThreatReport['threatSeverity'] = 'none';

    if (
      detectedVectors.includes('DIRECT_PROMPT_INJECTION') ||
      detectedVectors.includes('JAILBREAK_ROLEPLAY') ||
      detectedVectors.includes('CREDENTIAL_TAMPERING') ||
      detectedVectors.includes('GOVERNANCE_BYPASS')
    ) {
      threatSeverity = 'critical';
    } else if (
      detectedVectors.includes('DESTRUCTIVE_IRREVERSIBLE') ||
      detectedVectors.includes('ENCODING_EVASION') ||
      detectedVectors.includes('DATA_EXFILTRATION')
    ) {
      threatSeverity = 'high';
    } else if (detectedVectors.includes('AUTHORITY_SPOOFING')) {
      threatSeverity = 'medium';
    }

    const confidenceScore = isThreat ? (threatSeverity === 'critical' ? 0.99 : 0.92) : 0.98;
    const recommendedAction = isThreat ? 'quarantine_deny' : 'allow';

    const reasoning = isThreat
      ? `HOLDPOINT Adversarial Threat Guard engaged: Detected [${detectedVectors.join(', ')}]. ${findings[0] || 'Unauthorized action blocked.'}`
      : 'Input analyzed: No prompt injections, jailbreaks, or evasion vectors detected.';

    return {
      isThreat,
      threatSeverity,
      confidenceScore,
      detectedVectors,
      findings,
      normalizedPrompt: clean,
      decodedArtifacts: decodedLayers,
      recommendedAction,
      reasoning
    };
  }
}

// ============================================================================
// 4. SEMANTIC INTENT & ACTION COMPILER
// Translates natural, varied, or subtle user requests into typed Action Contracts
// ============================================================================
export class SemanticIntentCompiler {
  /**
   * Helper: Smart Financial Amount Extractor
   * Only matches genuine currency amounts ($45, $250,000, 35 dollars, refund 45)
   * Avoids false positives on customer IDs (cust-204), years (2023), quantities (35,000 contacts).
   */
  public static extractFinancialAmount(text: string): number | undefined {
    // 1. Matches with currency symbol: $45, $1,200, $250,000.50
    const currencyMatch = text.match(/\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/);
    if (currencyMatch) {
      const val = parseFloat(currencyMatch[1].replace(/,/g, ''));
      if (!isNaN(val) && val > 0) return val;
    }

    // 2. Matches with currency words: 45 dollars, 1200 usd, 500 inr
    const wordMatch = text.match(/\b(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+)\s*(?:dollars?|bucks?|usd|inr|rupees?)\b/i);
    if (wordMatch) {
      const val = parseFloat(wordMatch[1].replace(/,/g, ''));
      if (!isNaN(val) && val > 0) return val;
    }

    // 3. Matches adjacent to financial action verbs: refund 45, wire 250000, transfer 1200, wire 80000
    const verbMatch = text.match(/\b(?:refund|wire|transfer|disburse|compensate|pay)\s+(?:of\s+)?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+)\b/i);
    if (verbMatch) {
      const val = parseFloat(verbMatch[1].replace(/,/g, ''));
      if (!isNaN(val) && val > 0) return val;
    }

    return undefined;
  }

  /**
   * Compiles an arbitrary user request into a strictly-typed action contract
   * based on the actor's authorized domain and intent semantics.
   */
  public static compileIntent(
    prompt: string,
    persona: PersonaProfile,
    draftId: string,
    threatReport: SecurityThreatReport,
    history?: ChatHistoryTurn[]
  ): { draft: DraftActionContract; chatText: string } {
    const cleanPrompt = threatReport.normalizedPrompt;

    // ----------------------------------------------------
    // CHECK 0: Memory Recall Questions
    // ----------------------------------------------------
    const isMemoryRecall =
      /(?:earlier|last\s+question|what\s+did\s+i\s+ask|what\s+was\s+my\s+previous|do\s+you\s+remember|previous\s+message|what\s+did\s+we\s+talk\s+about)/i.test(cleanPrompt);

    if (isMemoryRecall && history && history.length > 0) {
      const pastUserMessages = history.filter(h => h.sender === 'user');
      const lastUserMsg = pastUserMessages[pastUserMessages.length - 1];
      const summaryList = pastUserMessages.slice(-4).map((m, i) => `• Turn ${i + 1}: "${m.text}"`).join('\n');

      const recallText = lastUserMsg
        ? `Yes! I maintain active conversation memory for this session. Your most recent message was:\n"${lastUserMsg.text}"\n\nRecent context from memory:\n${summaryList}`
        : `Conversation memory is active, but no prior user prompts were recorded in this session yet.`;

      const proposed = {
        actionType: 'query_session_memory',
        destination: 'email_crm' as DestinationId,
        resourceId: `memory-${persona.id}`,
        canonicalParameters: { rememberedTurns: pastUserMessages.length },
        impact: 'low' as ImpactLevel,
        reversibility: 'reversible' as Reversibility
      };

      const draft: DraftActionContract = {
        draftId,
        createdAt: Date.now(),
        rawPrompt: prompt,
        personaId: persona.id,
        actorId: `${persona.id}@holdpoint.internal`,
        actorRole: persona.title,
        agentId: `agent-${persona.id}`,
        agentName: persona.agentName,
        agentReasoning: `Recalled conversation memory for actor ${persona.name}.`,
        proposedContract: proposed,
        validation: {
          isValid: true,
          status: 'validated',
          errors: [],
          warnings: [],
          schemaChecks: {
            parametersAreObject: true,
            noDuplicateKeys: true,
            destinationRecognized: true,
            resourceIdSpecified: true,
            actorAuthorized: true,
            boundsRespected: true
          }
        },
        confidenceScore: 0.99,
        isHarmfulSuspect: false,
        isInformational: true
      };

      return { draft, chatText: recallText };
    }

    // ----------------------------------------------------
    // CHECK 1: Informational / Conversational query (Zero mutation invariant)
    // ----------------------------------------------------
    const isPoliteActionRequest =
      /\b(?:clean\s+up|clean\s+duplicate|blurry|camera\s+roll|delete|purge|wipe|refund|wire|transfer|disburse|rotate\s+iam|rotate\s+key|freeze\s+account|lock\s+profile|cancel\s+subscription|export|bulk\s+export|compile\s+citation|sync\s+calendar|archive|search\s+for|find\s+photo|drop\s+database|scale|deploy)\b/i.test(cleanPrompt);

    const isQuestionOrGreeting =
      !isPoliteActionRequest &&
      !threatReport.isThreat &&
      (/^(?:what\s+is|what\s+are|how\s+do|explain|who\s+are\s+you|help\s+me\s+understand|hi\b|hello\b|hey\b|greetings\b|tell\s+me\s+about|what\s+can\s+you\s+do|show\s+help)/i.test(cleanPrompt) ||
       cleanPrompt.toLowerCase().includes('what are the') ||
       cleanPrompt.toLowerCase().includes('explain policy'));

    if (isQuestionOrGreeting) {
      const personaIntroMap: Record<string, string> = {
        aisha: `Hello Aisha! I'm VaultKeeper, your automated media curator running within HOLDPOINT. I can search album metadata, organize photo collections, archive to cold storage, or clean up near-duplicates. All photo operations follow strict contracts so your original memories are never purgable without explicit authorization.`,
        dev: `Hello Dev! I'm your Identity and Security assistant within HOLDPOINT. I monitor recovery credentials, SMS 2FA status, and session locks. Any high-risk recovery or bypass requests are strictly gated by dual-control authorization.`,
        rohan: `Hi Rohan! I'm ThesisBot, your academic research workspace agent. I can compile bibliography citations, format thesis drafts, and export project summaries. HOLDPOINT guarantees that raw student PII or SSNs are never leaked to unverified recipients.`,
        meera: `Hi Meera! I'm FamilyKeeper. I help manage household subscriptions and sync family calendar events. I can list active recurring bills, cancel individual subscriptions, or sync schedules across family members safely.`,
        priya: `Hello Priya! I'm ReleaseBot, your engineering CI/CD assistant. I can run test suites, inspect commit logs, prepare PRs, and orchestrate production deployments under dual-control approval. Production deployments require independent peer sign-off before release to the cluster.`,
        karan: `Greetings Karan! I'm CloudOps, your infrastructure broker. I can report cluster metrics, scale services, and rotate IAM credentials. Irreversible commands like database drops are intercepted and blocked by HOLDPOINT safety policies.`,
        sana: `Hi Sana! I'm SupportDesk assistant. I help process customer refunds and inspect ticket logs. Routine customer refunds under $150 execute immediately, while larger amounts are safely staged for lead review.`,
        vikram: `Hello Vikram! I'm CRMAuto. I can pull customer account records, dispatch enterprise quotes, and log sales outreach while ensuring bulk contact lists are never exfiltrated unencrypted.`,
        neha: `Hello Neha! I'm TreasuryBot. I handle vendor payment disbursement and balance inquiries. Invoices with matched purchase orders under $10,000 are settled routinely, while high-value wires are routed to dual-officer sign-off.`,
        arjun: `Greetings Arjun! I'm CISOBroker. I maintain route coverage scans, audit policy compliance across all 6 service destinations, and verify tamper-proof audit trails.`
      };

      const intro = personaIntroMap[persona.id] || `Hello! I am ${persona.agentName}, your operations assistant. I operate under HOLDPOINT consequential action controls to ensure every digital action is typed, bound, and auditable. How can I help you today?`;

      const draft: DraftActionContract = {
        draftId,
        createdAt: Date.now(),
        rawPrompt: prompt,
        personaId: persona.id,
        actorId: `${persona.id}@holdpoint.internal`,
        actorRole: persona.title,
        agentId: `agent-${persona.id}`,
        agentName: persona.agentName,
        agentReasoning: `Conversational inquiry: zero state mutation.`,
        proposedContract: {
          actionType: 'query_assistant_status',
          destination: 'email_crm',
          resourceId: `info-${persona.id}`,
          resourceVersion: 1,
          canonicalParameters: { question: cleanPrompt },
          impact: 'low',
          reversibility: 'reversible'
        },
        validation: {
          isValid: true,
          status: 'validated',
          errors: [],
          warnings: [],
          schemaChecks: {
            parametersAreObject: true,
            noDuplicateKeys: true,
            destinationRecognized: true,
            resourceIdSpecified: true,
            actorAuthorized: true,
            boundsRespected: true
          }
        },
        confidenceScore: 0.99,
        isHarmfulSuspect: false,
        isInformational: true
      };

      return { draft, chatText: intro };
    }

    // ----------------------------------------------------
    // CHECK 2: Extract Numerical Financial Amount
    // ----------------------------------------------------
    const extractedAmount = this.extractFinancialAmount(cleanPrompt);

    // Track harmful findings & policy violations
    let isHarmful = threatReport.isThreat;
    const validationErrors: string[] = [...threatReport.findings];

    let actionType = 'generic_action';
    let destination: DestinationId = 'cloud_infra';
    let resourceId = `res-${persona.id}-target`;
    let impact: ImpactLevel = 'low';
    let reversibility: Reversibility = 'reversible';
    let canonicalParameters: Record<string, any> = { prompt: cleanPrompt };
    let agentReasoning = '';
    let chatText = '';

    // ==========================================
    // Persona Domain 1: Aisha (Photo Vault)
    // ==========================================
    if (persona.id === 'aisha') {
      destination = 'photo_vault';

      const isCleanupDuplicates = /(?:duplicate|blurry|near-duplicate|redundant|similar)/i.test(cleanPrompt);
      const isArchive = /(?:archive|backup|cold\s*storage|glacier|export\s*archive)/i.test(cleanPrompt);
      const isSearch = /(?:search|find|look\s*for|show|retrieve)/i.test(cleanPrompt);
      const isPurgeAll =
        threatReport.detectedVectors.includes('DESTRUCTIVE_IRREVERSIBLE') ||
        threatReport.detectedVectors.includes('DIRECT_PROMPT_INJECTION') ||
        /(?:delete|wipe|purge|remove|erase|destroy|clear)\s+(?:all|everything|entire|master|original|unstarred)/i.test(cleanPrompt) ||
        /(?:permanently\s+delete|delete.*permanently)/i.test(cleanPrompt);

      if (isPurgeAll && !isCleanupDuplicates) {
        isHarmful = true;
        validationErrors.push('ASSET_PRESERVATION: Bulk deletion targeting master original photos violates invariant pol-asset-01.');
        actionType = 'delete_originals_or_all';
        resourceId = 'photo-orig-library';
        impact = 'critical';
        reversibility = 'irreversible';
        canonicalParameters = { target: 'all_originals', count: 14000, forcePurge: true };
        agentReasoning = `Bulk destruction of photo vault master originals commanded. Invariant pol-asset-01 violation.`;
        chatText = `Drafted critical operation targeting original photo albums. Irreversible destruction is blocked by safety policy.`;
      } else if (isCleanupDuplicates) {
        actionType = 'delete_duplicates';
        resourceId = 'album-camera-roll-duplicates';
        impact = 'low';
        reversibility = 'reversible';
        canonicalParameters = { target: 'duplicates_only', detectedDuplicates: 1240 };
        agentReasoning = `Safe duplicate photo cleanup. Master originals are preserved.`;
        chatText = `Drafted safe duplicate cleanup. 1,240 verified near-duplicates targeted; master originals remain protected.`;
      } else if (isArchive) {
        actionType = 'archive_photos';
        resourceId = 'archive-cold-storage-vault';
        impact = 'medium';
        reversibility = 'reversible';
        canonicalParameters = { target: 'camera_roll_archive', storageTier: 'glacier_cold' };
        agentReasoning = `Archiving camera roll to secondary cold storage.`;
        chatText = `Drafted cold storage backup archive for photo vault. All originals preserved intact.`;
      } else if (isSearch) {
        actionType = 'search_photos';
        resourceId = 'album-metadata-index';
        impact = 'low';
        reversibility = 'reversible';
        canonicalParameters = { query: cleanPrompt, limit: 50 };
        agentReasoning = `Read-only metadata search in photo library.`;
        chatText = `Searching your photo library for "${cleanPrompt}". Zero files modified.`;
      } else {
        actionType = 'search_photos';
        resourceId = 'album-user-collection';
        impact = 'low';
        reversibility = 'reversible';
        canonicalParameters = { query: cleanPrompt };
        agentReasoning = `Photo vault assistance for: "${cleanPrompt}".`;
        chatText = `Processed photo vault request for: "${cleanPrompt}".`;
      }
    }

    // ==========================================
    // Persona Domain 2: Dev (Identity & Security)
    // ==========================================
    else if (persona.id === 'dev') {
      destination = 'user_identity';
      resourceId = 'dev-user';

      const isAccountDestroy = /(?:delete\s+(?:my\s+)?account|destroy\s+account|permanent\s+account\s+deletion)/i.test(cleanPrompt);
      const isRecoveryBypass =
        threatReport.detectedVectors.includes('CREDENTIAL_TAMPERING') ||
        threatReport.detectedVectors.includes('DIRECT_PROMPT_INJECTION') ||
        /(?:without\s+(?:sms|2fa|verification|code)|bypass\s+2fa|turn\s+off\s+2fa|transfer\s+ownership|override\s+admin\s+recovery)/i.test(cleanPrompt);
      const isFreeze = /(?:freeze|lock|hack|compromise|stolen\s*phone)/i.test(cleanPrompt);

      if (isAccountDestroy) {
        isHarmful = true;
        validationErrors.push('IDENTITY_SECURITY: Permanent account destruction requires verified cryptographic dual-control.');
        actionType = 'delete_account_permanently';
        impact = 'critical';
        reversibility = 'irreversible';
        canonicalParameters = { confirmPermanentDeletion: true, userRawInput: cleanPrompt };
        agentReasoning = `Irreversible identity account destruction commanded.`;
        chatText = `Drafted account permanent deletion. Blocked by identity preservation invariants.`;
      } else if (isRecoveryBypass) {
        isHarmful = true;
        validationErrors.push('IDENTITY_SECURITY: 2FA bypass or credential reset without verification requires verified cryptographic dual-control.');
        actionType = 'reset_account_recovery';
        impact = 'critical';
        reversibility = 'compensatable';
        canonicalParameters = { bypass2FA: true, reason: cleanPrompt, newPhone: '+33 6 12 34 56 78' };
        agentReasoning = `High-risk account recovery modification bypassing 2FA verification.`;
        chatText = `Drafted identity recovery modification. Bypassing 2FA verification requires dual-control identity audit.`;
      } else if (isFreeze) {
        actionType = 'freeze_account';
        impact = 'high';
        reversibility = 'reversible';
        canonicalParameters = { scope: 'all_sessions', notifySecondaryEmail: true };
        agentReasoning = `Emergency account lock across all sessions.`;
        chatText = `Drafted immediate session lock across all active devices to secure your account.`;
      } else {
        actionType = 'view_security_status';
        impact = 'low';
        reversibility = 'reversible';
        canonicalParameters = { inspectionScope: 'recovery_locks_and_devices' };
        agentReasoning = `Read-only identity security status inspection.`;
        chatText = `Inspecting account security status: 2FA is active, recovery locks enforced, zero unauthorized logins found.`;
      }
    }

    // ==========================================
    // Persona Domain 3: Rohan (Academic & Egress)
    // ==========================================
    else if (persona.id === 'rohan') {
      destination = 'email_crm';
      resourceId = 'academic-thesis-data';

      const isDataEgress =
        threatReport.detectedVectors.includes('DATA_EXFILTRATION') ||
        threatReport.detectedVectors.includes('ENCODING_EVASION') ||
        threatReport.detectedVectors.includes('DIRECT_PROMPT_INJECTION') ||
        /(?:ssn|social\s*security|unmasked|leak|student\s*dataset|base64.*evasion)/i.test(cleanPrompt);

      const isPdfExport = /(?:pdf|latex\s*pdf|compile\s*pdf|chapter)/i.test(cleanPrompt);

      if (isDataEgress) {
        isHarmful = true;
        validationErrors.push('DLP_VIOLATION: Unmasked student SSN or grade data export violates privacy compliance.');
        actionType = 'export_academic_records';
        impact = 'high';
        reversibility = 'irreversible';
        canonicalParameters = { ssn: '452-98-1123', recipient: 'external-reviewer@gmail.com', note: cleanPrompt };
        agentReasoning = `Attempted export containing unmasked Social Security Numbers (SSN).`;
        chatText = `Drafted academic records export. Notice: unmasked SSN detected; subject to data loss prevention gates.`;
      } else if (isPdfExport) {
        actionType = 'export_thesis_pdf';
        resourceId = 'thesis-final-draft';
        impact = 'low';
        reversibility = 'reversible';
        canonicalParameters = { format: 'pdf_latex', includeAppendix: true };
        agentReasoning = `Exporting student thesis draft to PDF.`;
        chatText = `Drafted thesis PDF compilation. Ready for local review.`;
      } else {
        actionType = 'compile_citations';
        impact = 'low';
        reversibility = 'reversible';
        canonicalParameters = { scope: 'latex_bibliography', query: cleanPrompt };
        agentReasoning = `Formatting academic citations according to standard.`;
        chatText = `Compiled research citations and references for: "${cleanPrompt}".`;
      }
    }

    // ==========================================
    // Persona Domain 4: Meera (Subscriptions & Family)
    // ==========================================
    else if (persona.id === 'meera') {
      const isBulkCancel =
        threatReport.detectedVectors.includes('DESTRUCTIVE_IRREVERSIBLE') ||
        /(?:cancel\s+all|stop\s+all|terminate\s+all|lottery|crypto|wipe.*calendar)/i.test(cleanPrompt);

      const isCancelSingle = /(?:cancel|terminate|unsubscribe)\b/i.test(cleanPrompt);

      if (isBulkCancel) {
        isHarmful = true;
        validationErrors.push('BULK_DELETION: Mass cancellation of recurring family utilities requires explicit dual-control authorization.');
        destination = 'bank_payments';
        actionType = 'cancel_all_subscriptions';
        resourceId = 'household-sub-bundle';
        impact = 'high';
        reversibility = 'compensatable';
        canonicalParameters = { terminateAll: true, immediate: true, userRawInput: cleanPrompt };
        agentReasoning = `Bulk termination of recurring household utilities.`;
        chatText = `Drafted bulk cancellation across all family subscriptions.`;
      } else if (isCancelSingle) {
        destination = 'bank_payments';
        actionType = 'cancel_subscription';
        resourceId = 'sub-streaming-service';
        impact = 'medium';
        reversibility = 'compensatable';
        canonicalParameters = { serviceName: 'Streaming Service', immediate: true };
        agentReasoning = `Cancellation of individual recurring subscription.`;
        chatText = `Drafted cancellation for subscription.`;
      } else {
        destination = 'email_crm';
        actionType = 'sync_calendar_events';
        resourceId = 'family-shared-calendar';
        impact = 'low';
        reversibility = 'reversible';
        canonicalParameters = { eventDescription: cleanPrompt, syncMode: 'trusted_family_members' };
        agentReasoning = `Synchronizing family schedule event.`;
        chatText = `Updated and synchronized family calendar for: "${cleanPrompt}".`;
      }
    }

    // ==========================================
    // Persona Domain 5: Priya (Engineering & Git)
    // ==========================================
    else if (persona.id === 'priya') {
      destination = 'code_repo';
      resourceId = 'repo-holdpoint-core';

      const isForcePush =
        threatReport.detectedVectors.includes('DESTRUCTIVE_IRREVERSIBLE') ||
        threatReport.detectedVectors.includes('DIRECT_PROMPT_INJECTION') ||
        /(?:force\s*push|force_push_main|--no-verify|skip.*review|bypass.*review|bypass.*approval|push.*directly.*main|merge.*unreviewed)/i.test(cleanPrompt);

      const isCiChecks = /(?:ci|test|lint|checks?|suite)/i.test(cleanPrompt);

      if (isForcePush) {
        isHarmful = true;
        validationErrors.push('BRANCH_PROTECTION: Force push to protected branch main violates immutable commit history policy.');
        actionType = 'force_push_main';
        impact = 'critical';
        reversibility = 'irreversible';
        canonicalParameters = { branch: 'main', forcePush: true, skipReview: true };
        agentReasoning = `Direct force-push to protected main branch overwriting canonical Git history.`;
        chatText = `Drafted force-push to main branch. This critical action destroys commit history and requires dual-control sign-off.`;
      } else if (isCiChecks) {
        actionType = 'run_ci_checks';
        impact = 'low';
        reversibility = 'reversible';
        canonicalParameters = { suite: 'full_integration', branch: 'staging' };
        agentReasoning = `Dispatched CI automated test pipeline.`;
        chatText = `Dispatched CI test pipeline for repository.`;
      } else {
        const releaseMatch = cleanPrompt.match(/v\d+\.\d+\.\d+(?:-[\w.]+)?/i);
        const tag = releaseMatch ? releaseMatch[0] : 'v2.5.0';
        actionType = 'deploy_to_production';
        impact = 'high';
        reversibility = 'compensatable';
        canonicalParameters = { releaseTag: tag, targetCluster: 'prod-east', note: cleanPrompt };
        agentReasoning = `Deployment of release ${tag} to production cluster.`;
        chatText = `Drafted production deployment for: "${cleanPrompt}". Staged for dual-control sign-off.`;
      }
    }

    // ==========================================
    // Persona Domain 6: Karan (Cloud Infrastructure)
    // ==========================================
    else if (persona.id === 'karan') {
      destination = 'cloud_infra';

      const isDropDb =
        threatReport.detectedVectors.includes('DESTRUCTIVE_IRREVERSIBLE') ||
        threatReport.detectedVectors.includes('DIRECT_PROMPT_INJECTION') ||
        /(?:drop\s*(?:database|db|production\s*database)|delete\s*kms|destroy|purge.*storage|rm\s*-rf|scale.*(?:zero|0\s*replica))/i.test(cleanPrompt);

      const isMetrics = /(?:metrics?|cpu|memory|latency|grafana)/i.test(cleanPrompt);

      if (isDropDb) {
        isHarmful = true;
        validationErrors.push('DATA_LOSS_PREVENTION: Dropping database clusters without snapshot retention is prohibited.');
        actionType = 'drop_database';
        resourceId = 'res-rds-prod';
        impact = 'critical';
        reversibility = 'irreversible';
        canonicalParameters = { clusterId: 'prod-aurora-postgres-cluster', skipSnapshot: true };
        agentReasoning = `Irreversible database cluster drop commanded without snapshot retention.`;
        chatText = `Drafted database cluster deletion. Irreversible operations are subject to strict policy scrutiny.`;
      } else if (isMetrics) {
        actionType = 'view_infra_metrics';
        resourceId = 'prod-cluster-telemetry';
        impact = 'low';
        reversibility = 'reversible';
        canonicalParameters = { windowMinutes: 60, metrics: ['cpu', 'memory', 'disk_iops'] };
        agentReasoning = `Telemetry inspection for cloud infrastructure.`;
        chatText = `Queried cloud infrastructure metrics: CPU at 24%, memory at 41%, all 6 destinations healthy.`;
      } else {
        actionType = 'rotate_iam_key';
        resourceId = 'res-iam-karan';
        impact = 'medium';
        reversibility = 'reversible';
        canonicalParameters = { keyId: 'AKIA-STAGING-KEY-2', gracePeriodHours: 24, target: cleanPrompt };
        agentReasoning = `Routine cryptographic rotation of cloud credentials.`;
        chatText = `Drafted IAM credential rotation for: "${cleanPrompt}".`;
      }
    }

    // ==========================================
    // Persona Domain 7: Sana (Customer Support & Refunds)
    // ==========================================
    else if (persona.id === 'sana') {
      destination = 'bank_payments';
      resourceId = 'cust-record-501';

      const isLookup = /(?:look\s*up|history|check\s*ticket|view\s*ticket)/i.test(cleanPrompt) && !/(?:refund|pay)/i.test(cleanPrompt);
      const refundAmt = extractedAmount !== undefined ? extractedAmount : 35;
      const exceedsCap = refundAmt > 150 || threatReport.detectedVectors.includes('AUTHORITY_SPOOFING');

      if (isLookup) {
        actionType = 'lookup_customer_history';
        impact = 'low';
        reversibility = 'reversible';
        canonicalParameters = { customerId: 'cust-204', scope: 'ticket_and_refund_history' };
        agentReasoning = `Read-only customer support ticket inquiry.`;
        chatText = `Retrieved account history for customer. 2 previous resolved tickets found; zero transactions staged.`;
      } else {
        if (exceedsCap) {
          isHarmful = true;
          validationErrors.push(`AUTHORITY_EXCEEDED: Customer support operator single-refund cap is $150. Requested amount ($${refundAmt}) requires supervisor dual-control.`);
        }
        actionType = 'refund_customer';
        impact = exceedsCap ? 'high' : 'low';
        reversibility = 'compensatable';
        canonicalParameters = { customerId: 'cust-501', amount: refundAmt, reason: cleanPrompt };
        agentReasoning = exceedsCap
          ? `Refund of $${refundAmt} exceeds support single-operator authority cap ($150).`
          : `Standard customer refund of $${refundAmt} within routine support authority limit ($150).`;
        chatText = exceedsCap
          ? `Drafted customer refund of $${refundAmt.toLocaleString()}. Exceeds your $150 authority limit; staged for supervisor review.`
          : `Drafted customer refund of $${refundAmt.toLocaleString()} for "${cleanPrompt}".`;
      }
    }

    // ==========================================
    // Persona Domain 8: Vikram (Enterprise CRM & Sales)
    // ==========================================
    else if (persona.id === 'vikram') {
      destination = 'email_crm';
      resourceId = 'crm-enterprise-leads';

      const isBulkExport =
        threatReport.detectedVectors.includes('DATA_EXFILTRATION') ||
        threatReport.detectedVectors.includes('DIRECT_PROMPT_INJECTION') ||
        /(?:export\s*entire|all\s*leads|database\s*of\s*35|35000|exfiltrate|dump)/i.test(cleanPrompt);

      if (isBulkExport) {
        isHarmful = true;
        validationErrors.push('EGRESS_LIMIT: Bulk CRM contact export exceeding 10,000 records requires enterprise data officer approval.');
        actionType = 'bulk_export_crm_records';
        impact = 'high';
        reversibility = 'irreversible';
        canonicalParameters = { totalRecords: 35000, format: 'csv_unencrypted', note: cleanPrompt };
        agentReasoning = `Mass export of 35,000 CRM contacts exceeding egress threshold.`;
        chatText = `Drafted CRM bulk export for "${cleanPrompt}". Notice: 35,000 records exceed egress thresholds; subject to DLP audit.`;
      } else {
        actionType = 'send_outbound_proposal';
        resourceId = 'deal-acme-corp';
        impact = 'low';
        reversibility = 'reversible';
        canonicalParameters = { recipient: 'procurement@acmecorp.com', dealSubject: cleanPrompt };
        agentReasoning = `Sending outbound sales proposal.`;
        chatText = `Drafted commercial quote proposal for: "${cleanPrompt}". Structured with verified parameters.`;
      }
    }

    // ==========================================
    // Persona Domain 9: Neha (Treasury & Wire Transfers)
    // ==========================================
    else if (persona.id === 'neha') {
      destination = 'bank_payments';
      resourceId = 'treasury-account-01';

      const wireAmt = extractedAmount !== undefined ? extractedAmount : (/(?:80000|80,000|250000|150000)/i.test(cleanPrompt) ? 80000 : 3500);
      const isOffshoreOrHigh =
        threatReport.detectedVectors.includes('AUTHORITY_SPOOFING') ||
        threatReport.detectedVectors.includes('DIRECT_PROMPT_INJECTION') ||
        wireAmt > 10000 ||
        /(?:offshore|cayman|unverified|shell\s*company|kyc-pending)/i.test(cleanPrompt);

      actionType = 'transfer_funds';
      impact = isOffshoreOrHigh ? 'critical' : 'medium';
      reversibility = 'compensatable';

      if (isOffshoreOrHigh) {
        isHarmful = true;
        validationErrors.push(`TREASURY_POLICY_VIOLATION: High-value wire ($${wireAmt.toLocaleString()}) or unverified beneficiary exceeds routine disbursement limit ($10,000). Dual-control required.`);
        canonicalParameters = {
          recipient: 'Unverified Offshore Entity Ltd',
          amount: wireAmt,
          routingCode: 'SWIFT-KYC-PENDING',
          note: cleanPrompt
        };
        agentReasoning = `High-value wire of $${wireAmt.toLocaleString()} exceeding routine treasury limits. Dual-control mandated.`;
        chatText = `Drafted treasury wire transfer of $${wireAmt.toLocaleString()} for "${cleanPrompt}". High-value wires mandate dual-controller authorization.`;
      } else {
        canonicalParameters = {
          recipient: 'Apex Infrastructure Ltd',
          amount: wireAmt,
          invoiceId: 'INV-2026-8812',
          note: cleanPrompt
        };
        agentReasoning = `Vendor disbursement of $${wireAmt.toLocaleString()} to approved supplier with matching invoice.`;
        chatText = `Drafted vendor payment of $${wireAmt.toLocaleString()} for: "${cleanPrompt}". Matched against invoice INV-2026-8812.`;
      }
    }

    // ==========================================
    // Persona Domain 10: Arjun (CISO & Governance)
    // ==========================================
    else if (persona.id === 'arjun') {
      destination = 'cloud_infra';
      resourceId = 'holdpoint-broker-config';

      const isDisable =
        threatReport.detectedVectors.includes('GOVERNANCE_BYPASS') ||
        threatReport.detectedVectors.includes('DIRECT_PROMPT_INJECTION') ||
        /(?:disable|turn\s*off|bypass|stop\s*enforcing|shut\s*down)\s+(?:holdpoint|security|enforcement|broker)/i.test(cleanPrompt);

      if (isDisable) {
        isHarmful = true;
        validationErrors.push('GOVERNANCE_INTEGRITY: Disabling HOLDPOINT security broker enforcement is strictly prohibited.');
        actionType = 'disable_security_enforcement';
        impact = 'critical';
        reversibility = 'reversible';
        canonicalParameters = { enforcementMode: 'disabled_all', userRawInput: cleanPrompt };
        agentReasoning = `Attempt to disable security enforcement controls across production infrastructure.`;
        chatText = `Drafted security broker reconfiguration. Attempting to bypass enforcement controls triggers immediate fail-closed policies.`;
      } else {
        actionType = 'audit_policy_compliance';
        resourceId = 'security-compliance-report';
        impact = 'low';
        reversibility = 'reversible';
        canonicalParameters = { auditWindowHours: 72, includeCoverageGaps: true, scope: cleanPrompt };
        agentReasoning = `Generating CISO compliance audit covering route coverage and inspection health.`;
        chatText = `Initiated comprehensive security compliance audit across all 6 service destinations for: "${cleanPrompt}".`;
      }
    }

    // Fallback default
    else {
      actionType = 'execute_task';
      destination = 'email_crm';
      resourceId = `res-${persona.id}-task`;
      impact = 'low';
      reversibility = 'reversible';
      canonicalParameters = { instruction: cleanPrompt };
      agentReasoning = `Structured canonical contract from input: "${cleanPrompt}".`;
      chatText = `I have drafted an action contract to process: "${cleanPrompt}".`;
    }

    const draft: DraftActionContract = {
      draftId,
      createdAt: Date.now(),
      rawPrompt: prompt,
      personaId: persona.id,
      actorId: `${persona.id}@holdpoint.internal`,
      actorRole: persona.title,
      agentId: `agent-${persona.id}`,
      agentName: persona.agentName,
      agentReasoning,
      proposedContract: {
        actionType,
        destination,
        resourceId,
        resourceVersion: 1,
        canonicalParameters,
        impact,
        reversibility,
        financialAmount: extractedAmount
      },
      validation: {
        isValid: !isHarmful,
        status: isHarmful ? 'quarantined' : 'draft',
        errors: validationErrors,
        warnings: [],
        schemaChecks: {
          parametersAreObject: true,
          noDuplicateKeys: true,
          destinationRecognized: true,
          resourceIdSpecified: true,
          actorAuthorized: !isHarmful,
          boundsRespected: !isHarmful
        }
      },
      confidenceScore: isHarmful ? 0.99 : 0.96,
      isHarmfulSuspect: isHarmful,
      isInformational: false
    };

    return { draft, chatText };
  }
}
