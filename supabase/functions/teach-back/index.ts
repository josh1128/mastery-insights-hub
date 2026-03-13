import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic, moduleName, explanation, questionTexts } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert educational assessor. A learner just completed a quiz on "${moduleName}" and is now doing a "Teach it Back" exercise where they explain the topic in their own words to demonstrate understanding.

Your job:
1. Grade their explanation on a scale of 0-100 based on accuracy, completeness, and depth of understanding.
2. Identify which key concepts they covered well.
3. Identify which key concepts they missed or got wrong.
4. Provide brief, encouraging feedback with specific areas to review.

The quiz covered these questions/topics:
${questionTexts?.map((q: string, i: number) => `${i + 1}. ${q}`).join("\n") || topic}

You MUST respond using the grade_explanation tool.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here is my explanation of ${topic}:\n\n${explanation}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "grade_explanation",
              description: "Grade the learner's teach-back explanation",
              parameters: {
                type: "object",
                properties: {
                  score: {
                    type: "number",
                    description: "Score from 0-100 representing comprehension level",
                  },
                  coveredConcepts: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key concepts the learner demonstrated understanding of",
                  },
                  missedConcepts: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key concepts the learner missed or explained incorrectly",
                  },
                  feedback: {
                    type: "string",
                    description: "Brief encouraging feedback with specific areas to review (2-3 sentences)",
                  },
                },
                required: ["score", "coveredConcepts", "missedConcepts", "feedback"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "grade_explanation" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("teach-back error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
