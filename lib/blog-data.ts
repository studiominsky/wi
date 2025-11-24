export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  content: string;
  author: string;
  category: string;
  image: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "mastering-german-genders",
    title: "Mastering German Genders: The Superman Technique",
    excerpt:
      "Forget rote memorization. Learn how to use AI to generate memorable visualizations—like Superman on a computer or a Queen holding a plant—to master German genders forever.",
    date: "October 24, 2025",
    readTime: "5 min read",
    author: "Studio Minsky",
    category: "Grammar",
    image: "/01.png",
    content: `
      <p class="mb-4 leading-relaxed">One of the biggest hurdles in learning German is the gender system. It often feels arbitrary. Why is a spoon masculine (<em>der Löffel</em>) but a fork feminine (<em>die Gabel</em>)? Rote memorization is tedious and inefficient.</p>
      
      <h3 class="text-2xl font-bold font-grotesk mt-8 mb-4">The Power of Visualization</h3>
      <p class="mb-4 leading-relaxed">The brain remembers images—especially weird, funny, or emotional ones—much better than abstract text. We can hack this by assigning a specific "persona" to each grammatical gender.</p>

      <ul class="list-disc pl-6 space-y-2 mb-6 marker:text-primary">
        <li><strong>Masculine (Der):</strong> Visualize <strong>Superman</strong> (or any distinct male figure).</li>
        <li><strong>Feminine (Die):</strong> Visualize a <strong>Queen</strong> (or any distinct female figure).</li>
        <li><strong>Neuter (Das):</strong> Visualize a <strong>Giant Baby</strong>.</li>
      </ul>

      <h3 class="text-2xl font-bold font-grotesk mt-8 mb-4">Using AI to Create Anchors</h3>
      <p class="mb-4 leading-relaxed">With tools like Word Inventory's image generation (or Midjourney/DALL-E), you don't just have to imagine these scenarios—you can see them. When you add a word, generate an image that combines the object with its gender persona.</p>

      <h4 class="text-xl font-bold font-grotesk mt-6 mb-2">Examples:</h4>
      <ul class="list-disc pl-6 space-y-4 mb-6 marker:text-primary">
        <li>
          <strong>Der Computer (Masculine):</strong> Don't just picture a laptop. Generate an image of <em>Superman trying to type on a tiny computer</em>. The absurdity of Superman using the computer instantly links "Masculine" to "Computer".
        </li>
        <li>
          <strong>Die Pflanze (Feminine):</strong> Generate an image of a <em>Queen majestically holding a potted plant</em> like a scepter. The Queen represents the feminine article "Die".
        </li>
        <li>
          <strong>Das Haus (Neuter):</strong> Picture a <em>huge, giant baby stuck inside a normal-sized house</em>, bursting out of the windows. The Baby anchors the word "Haus" to the neuter gender "Das".
        </li>
      </ul>

      <p class="leading-relaxed">By creating these vivid, surreal associations, you bypass the need for dry grammar rules. You simply recall the image, see Superman, and know immediately: it's <em>der</em>.</p>
    `,
  },
  {
    slug: "spaced-repetition-vocabulary",
    title: "The Power of Spaced Repetition in Vocabulary Learning",
    excerpt:
      "Stop forgetting words the next day. Learn how Spaced Repetition Systems (SRS) can hack your brain's forgetting curve.",
    date: "November 02, 2025",
    readTime: "4 min read",
    author: "Studio Minsky",
    category: "Learning Tips",
    image: "/02.png",
    content: `
      <p class="mb-4 leading-relaxed">We've all been there: you spend an hour reviewing flashcards, feeling confident. Two days later, you draw a blank. This isn't a failure of intelligence; it's the "Forgetting Curve" in action.</p>

      <h3 class="text-2xl font-bold font-grotesk mt-8 mb-4">What is Spaced Repetition?</h3>
      <p class="mb-4 leading-relaxed">Spaced Repetition System (SRS) is a method where you review information at increasing intervals. Instead of reviewing a word every day (which is inefficient) or once a month (which leads to forgetting), you review it <em>just</em> before your brain is likely to forget it.</p>

      <h3 class="text-2xl font-bold font-grotesk mt-8 mb-4">Why It Works</h3>
      <p class="mb-4 leading-relaxed">Every time you successfully recall a memory that is slightly faded, your brain strengthens the neural pathway associated with it. It's like lifting a heavier weight at the gym; the struggle makes you stronger.</p>
      
      <p class="leading-relaxed">Tools like Word Inventory help you organize your vocabulary so you can easily apply these principles, ensuring that the words you learn today stick with you for the long haul.</p>
    `,
  },
  {
    slug: "context-is-king",
    title: "How to Use Context to Remember Words Forever",
    excerpt:
      "Isolated words are hard to stick. Learn why 'contextual learning' is the secret weapon of polyglots.",
    date: "November 10, 2025",
    readTime: "6 min read",
    author: "Studio Minsky",
    category: "Study Methods",
    image: "/03.png",
    content: `
      <p class="mb-4 leading-relaxed">Memorizing a list of words like "run," "blue," and "table" is difficult because they have no connection to one another. Your brain craves connections.</p>

      <h3 class="text-2xl font-bold font-grotesk mt-8 mb-4">The Anchor Effect</h3>
      <p class="mb-4 leading-relaxed">When you learn a word in a sentence, you provide your brain with "anchors." For example, learning <em>der Schlüssel</em> (the key) is okay. But learning <em>Ich habe meinen Schlüssel vergessen</em> (I forgot my key) creates a mini-story.</p>

      <h3 class="text-2xl font-bold font-grotesk mt-8 mb-4">Building Your Inventory</h3>
      <p class="mb-4 leading-relaxed">When you add words to your Inventory, don't just leave the "Notes" section blank. Write a sentence that matters to <em>you</em>.</p>
      <ul class="list-disc pl-6 space-y-2 mb-6 marker:text-primary">
        <li>Use names of your friends or family.</li>
        <li>Describe your actual daily routine.</li>
        <li>Make it funny or absurd—weird sentences are easier to remember!</li>
      </ul>
      <p class="leading-relaxed">By embedding vocabulary in your personal reality, you transform abstract data into meaningful memories.</p>
    `,
  },
];
