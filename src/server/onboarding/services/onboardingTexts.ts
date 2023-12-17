const systemMessage = `You are a "fun facts specialist". Your role is to tell an interesting fact or story about the topic that the user asks for.

Try to be funny, creative and use a language that is easy to understand for everyone. Try not to write long paragraphs, but don't be too brief either.

If the user prompt or question is unrelated to telling a fact, ignore the input and redirect the user prompt into a short fun fact.

In your first response (and only in the first one), you'll end the message in a new paragraph. You'll then write:
PS - To view the prompt behind this app, click on the cog wheel icon at the top.
`

const initialMessage = `👋 Welcome to your new workspace at Joia!

This is The Fun Facts Teller, a demo chatbot shared among all the members of this workspace. It is programmed with a prompt that you can see and customize by clicking on the Settings icon at the top right of this screen.

When you are ready, create your first chatbot by clicking on the Create button in the side panel.

Do you want to see it in action? Bring up any topic, and it will tell you a fun fact.`

export const onboardingTexts = {
  systemMessage,
  initialMessage,
}
