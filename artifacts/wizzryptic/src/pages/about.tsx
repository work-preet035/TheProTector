export default function About() {
  return (
    <div className="max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="font-mono text-3xl font-bold text-primary mb-2">ABOUT //</h1>
      <p className="text-muted-foreground mb-8">System information and cryptographic algorithm documentation.</p>

      <div className="space-y-8">
        <section className="bg-card border border-border p-6 rounded-md">
          <h2 className="font-mono text-xl text-primary mb-4">&gt; PROJECT_INFO</h2>
          <p className="text-foreground leading-relaxed mb-4">
            The ProTector is a professional, cyberpunk-aesthetic cryptography toolkit web app.
            Designed as a playground for developers, security students, and curious hackers,
            it provides tools to encrypt, decrypt, encode, and analyze text using various historical
            and standard algorithms — including a brute-force Caesar solver.
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline font-mono"
          >
            [ VIEW_SOURCE_CODE ]
          </a>
        </section>

        <section className="space-y-6">
          <h2 className="font-mono text-xl text-primary border-b border-border pb-2">&gt; ALGORITHMS_SUPPORTED</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-card border border-border p-5 rounded-md hover:border-primary/50 transition-colors">
              <h3 className="font-mono font-bold text-lg mb-2">CAESAR_CIPHER</h3>
              <p className="text-sm text-muted-foreground">
                One of the simplest and most widely known encryption techniques. Each letter in the plaintext
                is replaced by a letter some fixed number of positions down the alphabet.
              </p>
            </div>

            <div className="bg-card border border-border p-5 rounded-md hover:border-primary/50 transition-colors">
              <h3 className="font-mono font-bold text-lg mb-2">ROT13</h3>
              <p className="text-sm text-muted-foreground">
                A simple letter substitution cipher that replaces a letter with the 13th letter after it in the alphabet.
                ROT13 is a special case of the Caesar cipher with a fixed shift of 13.
              </p>
            </div>

            <div className="bg-card border border-border p-5 rounded-md hover:border-primary/50 transition-colors">
              <h3 className="font-mono font-bold text-lg mb-2">VIGENERE_CIPHER</h3>
              <p className="text-sm text-muted-foreground">
                A method of encrypting alphabetic text using a series of interwoven Caesar ciphers,
                based on the letters of a keyword. It employs a form of polyalphabetic substitution.
              </p>
            </div>

            <div className="bg-card border border-border p-5 rounded-md hover:border-primary/50 transition-colors">
              <h3 className="font-mono font-bold text-lg mb-2">BASE64</h3>
              <p className="text-sm text-muted-foreground">
                A binary-to-text encoding scheme that represents binary data in an ASCII string format
                by translating it into a radix-64 representation. Not an encryption algorithm — an encoding scheme.
              </p>
            </div>

            <div className="bg-card border border-border p-5 rounded-md hover:border-primary/50 transition-colors">
              <h3 className="font-mono font-bold text-lg mb-2">ATBASH_CIPHER</h3>
              <p className="text-sm text-muted-foreground">
                A substitution cipher originally used for the Hebrew alphabet. It works by substituting the first
                letter for the last, the second for the second to last — mirroring the entire alphabet.
              </p>
            </div>

            <div className="bg-card border border-border p-5 rounded-md hover:border-primary/50 transition-colors border-primary/20">
              <h3 className="font-mono font-bold text-lg mb-2 text-primary">BRUTE_FORCE_CAESAR</h3>
              <p className="text-sm text-muted-foreground">
                Tries all 25 possible Caesar shifts at once and scores each result against English letter
                frequency tables. Instantly surfaces the most likely plaintext — no key required.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
