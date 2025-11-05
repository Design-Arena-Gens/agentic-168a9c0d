import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-demo",
});

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, model, temperature } = await req.json();

    // For demo purposes without API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "dummy-key-for-demo") {
      // Simulate AI response with intelligent fallback
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const lastMessage = messages[messages.length - 1]?.content || "";

      return NextResponse.json({
        message: generateFallbackResponse(lastMessage, model),
      });
    }

    // Real API call when key is available
    const systemMessage = {
      role: "system",
      content: `You are an advanced AI assistant. You are helpful, harmless, and honest. You provide detailed, accurate, and thoughtful responses. You can assist with coding, analysis, creative writing, problem-solving, and much more.`,
    };

    const response = await openai.chat.completions.create({
      model: mapModelName(model),
      messages: [systemMessage, ...messages],
      temperature: temperature || 0.7,
      max_tokens: 4000,
    });

    const assistantMessage = response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";

    return NextResponse.json({
      message: assistantMessage,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

function mapModelName(model: string): string {
  const modelMap: { [key: string]: string } = {
    "gpt-4o": "gpt-4o",
    "gpt-4-turbo": "gpt-4-turbo-preview",
    "claude-3.5-sonnet": "gpt-4o", // Fallback to GPT-4o
    "gpt-3.5-turbo": "gpt-3.5-turbo",
  };
  return modelMap[model] || "gpt-4o";
}

function generateFallbackResponse(userMessage: string, model: string): string {
  const lowerMessage = userMessage.toLowerCase();

  // Code-related queries
  if (lowerMessage.includes("code") || lowerMessage.includes("function") || lowerMessage.includes("programming")) {
    return `I can help you with that! Here's a comprehensive solution:

\`\`\`javascript
// Example implementation
function advancedSolution(input) {
  // Process the input
  const processed = input.map(item => ({
    ...item,
    enhanced: true,
    timestamp: new Date()
  }));

  // Apply advanced logic
  return processed.filter(item => item.enhanced);
}

// Usage
const result = advancedSolution(yourData);
console.log(result);
\`\`\`

This solution provides:
- ✅ Clean, maintainable code
- ✅ Error handling
- ✅ Type safety considerations
- ✅ Performance optimization

Would you like me to explain any part in more detail or adapt this to your specific use case?`;
  }

  // Data analysis
  if (lowerMessage.includes("analyze") || lowerMessage.includes("data") || lowerMessage.includes("statistics")) {
    return `I'll help you analyze that data. Here's a comprehensive approach:

**Analysis Framework:**

1. **Data Collection & Cleaning**
   - Identify missing values
   - Remove duplicates
   - Normalize formats

2. **Exploratory Analysis**
   - Calculate key statistics (mean, median, mode)
   - Identify trends and patterns
   - Detect outliers

3. **Insights & Recommendations**
   - Key findings from the data
   - Actionable recommendations
   - Next steps for deeper analysis

Would you like me to focus on any specific aspect of the analysis?`;
  }

  // Creative writing
  if (lowerMessage.includes("write") || lowerMessage.includes("story") || lowerMessage.includes("creative")) {
    return `I'd be happy to help with creative writing! Here's a compelling start:

**The Beginning:**

The city lights flickered like distant stars as the rain began to fall. Each drop carried a story, a memory, a dream yet to be realized. In the heart of the metropolis, where technology and humanity intertwined, something extraordinary was about to unfold.

**Key Elements:**
- Rich, descriptive language
- Engaging narrative hooks
- Character development opportunities
- Plot progression potential

Would you like me to continue this story, or would you prefer a different style or genre?`;
  }

  // Problem-solving
  if (lowerMessage.includes("help") || lowerMessage.includes("how to") || lowerMessage.includes("solve")) {
    return `I'm here to help! Let me break this down into actionable steps:

**Solution Approach:**

**Step 1: Understanding the Problem**
- Identify the core challenge
- List all constraints and requirements
- Determine success criteria

**Step 2: Developing a Strategy**
- Consider multiple approaches
- Evaluate pros and cons
- Select the optimal path

**Step 3: Implementation**
- Create a detailed action plan
- Execute systematically
- Monitor progress

**Step 4: Refinement**
- Test and validate results
- Iterate based on feedback
- Optimize for best outcomes

What specific aspect would you like me to dive deeper into?`;
  }

  // Default comprehensive response
  return `Great question! I'm ${model.toUpperCase()}, and I'm here to provide you with detailed, accurate assistance.

**Key Capabilities I Offer:**

🎯 **Comprehensive Analysis**
- Deep dive into complex topics
- Multi-faceted perspectives
- Evidence-based reasoning

💻 **Technical Expertise**
- Code generation and debugging
- Architecture design
- Best practices and optimization

✍️ **Creative Solutions**
- Innovative problem-solving
- Content creation
- Brainstorming and ideation

📊 **Data Intelligence**
- Statistical analysis
- Pattern recognition
- Actionable insights

I'm designed to provide responses that are:
- **Accurate**: Based on reliable information
- **Detailed**: Comprehensive and thorough
- **Practical**: Actionable and useful
- **Clear**: Easy to understand

How can I specifically assist you today? Feel free to ask about anything from coding and analysis to creative projects and problem-solving!`;
}
