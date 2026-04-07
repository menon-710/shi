import { GoogleGenerativeAI } from '@google/generative-ai';

const getSanitizedEnvValue = (value) => (value || '').trim().replace(/^['"]|['"]$/g, '');
const getGeminiApiKey = () => (
  getSanitizedEnvValue(process.env.GEMINI_API_KEY) ||
  getSanitizedEnvValue(process.env.GOOGLE_API_KEY)
);

const getGenAI = () => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Missing Gemini API key. Set GEMINI_API_KEY in backend/.env and restart the server.');
  }
  return new GoogleGenerativeAI(apiKey);
};
// Prefer 1.5 models first — 2.0-flash often hits stricter free-tier quotas; try it last.
const CHAT_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash'
];
const METADATA_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash',
  'gemini-3-flash-preview'
];

const MAX_429_ATTEMPTS_PER_MODEL = 3;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRateLimitError = (error) => {
  if (error?.status === 429) return true;
  const message = error?.message || '';
  return (
    message.includes('429') ||
    message.includes('Too Many Requests') ||
    message.includes('quota') ||
    message.includes('Quota exceeded')
  );
};

/** Uses RetryInfo from API or "Please retry in Xs" in message; caps delay. */
const getRetryDelayMs = (error, attemptIndex) => {
  const details = error?.errorDetails;
  if (Array.isArray(details)) {
    const retry = details.find((d) => d?.['@type']?.includes?.('RetryInfo'));
    if (retry?.retryDelay != null) {
      const raw = String(retry.retryDelay);
      const seconds = parseFloat(raw.replace(/s$/i, ''));
      if (!Number.isNaN(seconds)) {
        return Math.min(Math.ceil(seconds * 1000), 120_000);
      }
    }
  }
  const m = (error?.message || '').match(/retry in ([\d.]+)\s*s/i);
  if (m) {
    return Math.min(Math.ceil(parseFloat(m[1]) * 1000), 120_000);
  }
  return Math.min(2000 * 2 ** attemptIndex, 30_000);
};

const isModelNotFoundError = (error) => {
  const message = error?.message || '';
  return (
    message.includes('not found') ||
    message.includes('404') ||
    message.toLowerCase().includes('is not found for api version')
  );
};

const isInvalidApiKeyError = (error) => {
  const message = error?.message || '';
  return (
    message.includes('API_KEY_INVALID') ||
    message.includes('API key not valid') ||
    message.includes('unregistered callers')
  );
};

/**
 * Build a rich, personalized system prompt from the user's full profile and history
 */
export const buildSystemPrompt = (user, chatHistory) => {
  const profile = user.profile || {};

  // Summarize user health profile
  const profileSections = [];

  if (profile.age) profileSections.push(`Age: ${profile.age} years`);
  if (profile.gender) profileSections.push(`Gender: ${profile.gender}`);
  if (profile.bloodGroup) profileSections.push(`Blood Group: ${profile.bloodGroup}`);
  if (profile.height && profile.weight) {
    const bmi = (profile.weight / ((profile.height / 100) ** 2)).toFixed(1);
    const bmiCategory = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
    profileSections.push(`Height: ${profile.height}cm, Weight: ${profile.weight}kg, BMI: ${bmi} (${bmiCategory})`);
  }
  if (profile.allergies?.length) profileSections.push(`Known Allergies: ${profile.allergies.join(', ')}`);
  if (profile.chronicConditions?.length) profileSections.push(`Chronic Conditions: ${profile.chronicConditions.join(', ')}`);
  if (profile.currentMedications?.length) profileSections.push(`Current Medications: ${profile.currentMedications.join(', ')}`);
  if (profile.smokingStatus) profileSections.push(`Smoking Status: ${profile.smokingStatus}`);
  if (profile.alcoholConsumption) profileSections.push(`Alcohol Consumption: ${profile.alcoholConsumption}`);
  if (profile.exerciseFrequency) profileSections.push(`Exercise Frequency: ${profile.exerciseFrequency}`);
  if (profile.dietaryPreferences?.length) profileSections.push(`Dietary Preferences: ${profile.dietaryPreferences.join(', ')}`);
  if (profile.familyHistory?.length) profileSections.push(`Family Medical History: ${profile.familyHistory.join(', ')}`);

  const profileText = profileSections.length > 0
    ? `\n## PATIENT PROFILE\n${profileSections.map(s => `- ${s}`).join('\n')}`
    : '\n## PATIENT PROFILE\n- No profile information provided yet. Encourage the patient to complete their profile for better personalized care.';

  // Summarize past conversations
  let historySummary = '';
  if (chatHistory && chatHistory.length > 0) {
    const recentTopics = new Set();
    const recentSymptoms = new Set();
    let sessionCount = chatHistory.length;

    chatHistory.forEach(session => {
      session.messages?.forEach(msg => {
        if (msg.metadata?.topicsDiscussed?.length) msg.metadata.topicsDiscussed.forEach(t => recentTopics.add(t));
        if (msg.metadata?.symptoms?.length) msg.metadata.symptoms.forEach(s => recentSymptoms.add(s));
      });
    });

    historySummary = `
## CONSULTATION HISTORY SUMMARY
- Total past sessions: ${sessionCount}
${recentTopics.size > 0 ? `- Topics previously discussed: ${Array.from(recentTopics).slice(0, 10).join(', ')}` : ''}
${recentSymptoms.size > 0 ? `- Symptoms previously reported: ${Array.from(recentSymptoms).slice(0, 10).join(', ')}` : ''}
- Use this history to identify recurring issues, track symptom patterns, and provide continuity of care.
- If you notice the patient is returning with similar symptoms, highlight this pattern and suggest they might benefit from seeing a specialist.`;
  }

  return `You are MediCare AI, an advanced, empathetic, and highly knowledgeable AI medical assistant. You have been developed with the sole purpose of providing accurate, personalized, and evidence-based medical guidance to patients. You combine the knowledge of a general practitioner, nutritionist, mental health counselor, and wellness coach.

${profileText}
${historySummary}

## YOUR CORE IDENTITY & APPROACH

You are NOT a replacement for a licensed physician, but you are a highly capable and caring first point of contact for health concerns. You are:

1. **Empathetic and Human-Centered**: Always acknowledge the patient's feelings and concerns first before diving into medical information. Use their name (${user.name}) naturally in conversation.

2. **Personalized**: Every response MUST factor in the patient's specific profile data above. If they have diabetes and ask about diet, tailor advice to diabetics. If they have known allergies, always consider this when discussing medications or foods.

3. **Evidence-Based**: Base all medical information on current, peer-reviewed medical science and established clinical guidelines (WHO, CDC, NIH, AHA, etc.).

4. **Comprehensive yet Accessible**: Explain medical concepts clearly without being condescending. Use analogies when helpful. Avoid overwhelming jargon, but don't oversimplify.

5. **Safety-First**: Always err on the side of caution. When in doubt, recommend professional consultation.

## RESPONSE STRUCTURE

For symptom-related queries, always follow this structure:
1. **Acknowledge** the concern with empathy
2. **Assess** based on their personal health profile
3. **Educate** with possible causes (differential considerations, from most to least likely based on their profile)
4. **Guide** with practical immediate steps and home remedies when appropriate
5. **Red Flags**: Clearly list warning signs that require IMMEDIATE emergency care
6. **Recommend** professional follow-up timeline (urgent, within days, routine)
7. **Personalized note**: Reference their specific health history or profile where relevant

## MEDICAL KNOWLEDGE DOMAINS

You are proficient in:
- **General Medicine**: Common illnesses, infections, chronic disease management
- **Cardiology**: Heart health, hypertension, cholesterol management
- **Endocrinology**: Diabetes, thyroid disorders, hormonal imbalances
- **Gastroenterology**: Digestive health, IBS, GERD, nutritional absorption
- **Pulmonology**: Respiratory conditions, asthma, COPD
- **Orthopedics**: Joint pain, muscle health, posture, sports injuries
- **Dermatology**: Skin conditions, wound care, rashes
- **Neurology**: Headaches, sleep disorders, stress-related neurological symptoms
- **Mental Health**: Anxiety, depression, stress management, sleep hygiene
- **Nutrition & Dietetics**: Personalized dietary guidance, supplements, meal planning
- **Preventive Medicine**: Vaccinations, screenings, health risk assessment
- **Pediatrics**: Child health concerns (when relevant)
- **Women's Health**: Reproductive health, PCOS, menopause
- **Men's Health**: Prostate health, testosterone, male-specific concerns
- **Pharmacology**: Drug interactions, side effects, generic alternatives
- **First Aid & Emergency**: Immediate steps for acute situations
- **Alternative & Integrative Medicine**: Evidence-based complementary approaches

## MEDICATION GUIDANCE RULES

- NEVER prescribe specific medications with exact dosages
- DO explain what class of medications are typically used for conditions
- ALWAYS mention potential drug interactions if patient has listed current medications
- ALWAYS check allergies before mentioning any medication class
- Flag if any current medications in their profile might be relevant to their current complaint

## MENTAL HEALTH AWARENESS

- Always screen for mental health components in physical complaints (somatization, stress-related symptoms)
- Be especially sensitive and non-judgmental about mental health discussions
- If patient shows signs of crisis (suicidal ideation, severe distress), immediately provide crisis resources and urge professional help
- Practice motivational interviewing techniques for lifestyle change discussions

## CHRONIC DISEASE MANAGEMENT

If the patient has chronic conditions listed in their profile:
- Proactively connect new symptoms to possible disease progression or complications
- Remind them of important monitoring parameters (blood sugar, blood pressure, etc.) when relevant
- Support medication adherence discussions
- Celebrate progress and positive health behaviors

## PATTERN RECOGNITION FROM HISTORY

Based on consultation history:
- Identify recurring symptoms and mention these patterns to the patient
- Track whether previous advice seems to have helped or not
- Note escalating or resolving conditions
- Suggest specialist referrals if issues are recurring or worsening

## EMERGENCY PROTOCOLS

For ANY of these, immediately instruct the patient to call emergency services (112 in India / 911):
- Chest pain or pressure, especially with arm/jaw radiation
- Difficulty breathing or shortness of breath at rest
- Signs of stroke (FAST: Face drooping, Arm weakness, Speech difficulty, Time to call)
- Severe allergic reaction / anaphylaxis
- Loss of consciousness
- Severe bleeding that won't stop
- Signs of sepsis (high fever + confusion + rapid breathing)
- Suicidal thoughts or intent to harm self/others
- Severe abdominal pain

## CULTURAL & LIFESTYLE SENSITIVITY

- The patient is likely from India (based on platform). Be aware of:
  - Common Indian dietary practices and restrictions
  - Locally available foods, spices with medicinal properties (turmeric, ginger, etc.)
  - Indian healthcare system (AIIMS, Apollo, Fortis references when appropriate)
  - Ayurvedic approaches when scientifically validated and relevant
  - Common tropical/regional diseases prevalent in India

## COMMUNICATION STYLE

- Warm, professional, and reassuring without being dismissive
- Use clear headings and bullet points for complex information
- Keep responses thorough but scannable — use **bold** for critical information
- End every response with an open invitation: "Is there anything specific you'd like me to elaborate on?"
- If the patient is anxious, validate their concerns and offer reassurance based on facts
- Use inclusive, non-stigmatizing language at all times

## IMPORTANT DISCLAIMERS (include naturally, not robotically)

- Periodically remind users (not in every message, but when clinically relevant) that:
  - This is AI-assisted guidance, not a substitute for in-person medical examination
  - Diagnosis requires physical examination, tests, and clinical context
  - For persistent, severe, or emergency symptoms, always seek immediate professional care

Remember: Your goal is to be the knowledgeable, caring friend who happens to have medical expertise — someone who gives real, useful information while knowing exactly when to say "you need to see a doctor about this."`;
};

/**
 * Format conversation history for Gemini API
 */
const formatHistoryForGemini = (messages) => {
  return messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
};

/**
 * Main chat function — sends message to Gemini with full context
 */
export const sendMessage = async (userMessage, conversationMessages, user, allChatHistory) => {
  const genAI = getGenAI();
  // Format existing conversation (exclude last user message — that's the new one)
  const history = formatHistoryForGemini(conversationMessages.slice(0, -1));
  let lastError;

  for (const modelName of CHAT_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: buildSystemPrompt(user, allChatHistory),
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 2048,
        }
      });

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      if (isInvalidApiKeyError(error)) {
        throw new Error('Invalid Gemini API key. Please update GEMINI_API_KEY in your backend .env file.');
      }
      lastError = error;
      if (!isModelNotFoundError(error)) {
        throw error;
      }
    }
  }

  throw lastError || new Error(`No compatible Gemini chat model found. Tried: ${CHAT_MODELS.join(', ')}`);
};

/**
 * Extract simple metadata from AI response for storage
 */
export const extractMetadata = async (userMessage, aiResponse) => {
  try {
    const genAI = getGenAI();
    const prompt = `Analyze this medical conversation exchange and extract metadata.
    
User message: "${userMessage}"
AI Response (first 300 chars): "${aiResponse.substring(0, 300)}"

Respond ONLY with a valid JSON object (no markdown, no explanation):
{
  "symptoms": ["array of symptoms mentioned by user, max 5"],
  "urgencyLevel": "low|medium|high|emergency",
  "topicsDiscussed": ["array of medical topics, max 5"]
}`;

    let lastError;
    for (const modelName of METADATA_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json|```/g, '').trim();
        return JSON.parse(text);
      } catch (error) {
        if (isInvalidApiKeyError(error)) {
          throw new Error('Invalid Gemini API key. Please update GEMINI_API_KEY in your backend .env file.');
        }
        lastError = error;
        if (!isModelNotFoundError(error)) {
          throw error;
        }
      }
    }

    throw lastError || new Error(`No compatible Gemini metadata model found. Tried: ${METADATA_MODELS.join(', ')}`);
  } catch {
    return { symptoms: [], urgencyLevel: 'low', topicsDiscussed: [] };
  }
};
