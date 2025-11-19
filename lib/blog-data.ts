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
    title: "Mastering German Genders: Der, Die, Das Explained",
    excerpt:
      "Why is a table masculine and a girl neuter? Unraveling the mystery of German grammatical gender with simple rules and mnemonics.",
    date: "October 24, 2025",
    readTime: "5 min read",
    author: "Studio Minsky",
    category: "Grammar",
    image: "/01.png",
    content: `
      <p class="mb-4 leading-relaxed">One of the most daunting aspects of learning German is undoubtedly the gender system. Unlike English, where 'the' covers everything, German demands you choose between <strong>der</strong> (masculine), <strong>die</strong> (feminine), and <strong>das</strong> (neuter).</p>
      
      <h3 class="text-2xl font-bold font-grotesk mt-8 mb-4">It's Not About Biology</h3>
      <p class="mb-4 leading-relaxed">The first rule of German gender is: forget logic. Or at least, biological logic. Grammatical gender is a classification system, not a description of the object's innate qualities. This is why <em>das Mädchen</em> (the girl) is neuter—because words ending in <em>-chen</em> are always neuter.</p>

      <h3 class="text-2xl font-bold font-grotesk mt-8 mb-4">Endings Are Your Best Friend</h3>
      <p class="mb-4 leading-relaxed">Instead of guessing, look at the end of the word. Here are a few reliable rules:</p>
      <ul class="list-disc pl-6 space-y-2 mb-6 marker:text-primary">
        <li><strong>Masculine (Der):</strong> Words ending in <em>-ig, -ling, -or, -ismus</em> (e.g., <em>der Honig, der Motor</em>).</li>
        <li><strong>Feminine (Die):</strong> Words ending in <em>-ung, -keit, -heit, -schaft, -tät</em> (e.g., <em>die Zeitung, die Freiheit</em>).</li>
        <li><strong>Neuter (Das):</strong> Words ending in <em>-chen, -lein, -ment, -tum</em> (e.g., <em>das Brötchen, das Dokument</em>).</li>
      </ul>

      <p class="leading-relaxed">By focusing on these suffixes, you can instantly identify the gender of thousands of nouns without rote memorization.</p>
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
