// Curated seed list for the weak-secret cracker. Deliberately grouped by source so
// the UI can explain *why* a recovered secret matters.
//
// This is a defensive audit aid: it answers "is my own token signed with something
// guessable?" It is not a tool for attacking tokens you do not own.

export const DICTIONARY_SEEDS = {
  // Framework and library defaults that ship in tutorials, docs and starter templates.
  framework: [
    "secret", "supersecret", "super_secret", "my-secret", "mysecret", "my_secret",
    "jwt_secret", "jwt-secret", "jwtsecret", "jwt", "token_secret", "auth_secret",
    "app_secret", "appsecret", "app-secret", "secret_key", "secretkey", "secretkey123",
    "your-256-bit-secret", "your_256_bit_secret", "your-secret-key", "yoursecretkey",
    "changeme", "change_me", "changethis", "please_change_me", "replace_me",
    "default", "default_secret", "dev_secret", "devsecret", "dev-secret",
    "test", "testing", "test_secret", "testsecret", "test-secret", "test123",
    "demo", "demo_secret", "sample", "sample_secret", "example", "example_secret",
    "placeholder", "todo", "fixme", "dummy", "dummy_secret",
    "shhhhh", "shhhh", "shhh", "hush", "quiet", "notsosecret",
  ],

  // Generic application secrets.
  generic: [
    "admin", "administrator", "root", "user", "guest", "default", "system",
    "api", "apikey", "api_key", "api-key", "apikey123", "api_secret",
    "access", "access_key", "token", "tokens", "bearer", "session",
    "signing_key", "signingkey", "signing-key", "private_key", "privatekey",
    "encryption_key", "encrypt_key", "encryptionkey",
    "master_key", "masterkey", "master-key", "master_secret",
    "pass", "passwd", "password", "passw0rd", "p@ssword", "p@ssw0rd",
    "Password", "PASSWORD", "password1", "password123", "Password1", "Password123",
    "admin123", "admin1234", "administrator", "root123", "letmein",
    "welcome", "qwerty", "qwerty123", "abc123", "111111", "000000",
  ],

  // The most common leaked passwords worldwide, by volume.
  common: [
    "123456", "123456789", "12345678", "1234567", "1234567890", "12345", "1234",
    "123123", "121212", "11111111", "00000000", "qwertyuiop", "1qaz2wsx",
    "qazwsx", "654321", "555555", "666666", "7777777", "987654321", "87654321",
    "asdfgh", "zxcvbn", "asdfghjkl", "qazwsxedc", "asdfjkl;", "1q2w3e4r",
    "1qazxsw2", "zaq12wsx", "q1w2e3r4", "1q2w3e", "qwer1234", "qwaszx",
    "football", "baseball", "basketball", "soccer", "hockey", "tennis",
    "superman", "batman", "spiderman", "ironman", "pokemon", "starwars",
    "michael", "jennifer", "jessica", "thomas", "charlie", "daniel", "andrew",
    "joshua", "james", "robert", "john", "david", "george", "richard",
    "iloveyou", "princess", "sunshine", "trustno1", "monkey", "dragon",
    "master", "shadow", "ashley", "bailey", "access14", "flower", "hello",
    "whatever", "charlie1", "donald", "loveme", "mustang", "buster",
    "tigger", "soccer1", "hunter", "hunter2", "george1", "andrea", "joshua1",
    "matrix", "summer", "winter", "spring", "autumn", "diamond",
    "freedom", "whatever1", "ginger", "hammer", "silver", "junior",
    "thomas1", "ranger", "dallas", "orange", "yankees", "jordan23",
    "harley", "robert1", "andrew1", "andrew2", "chicago", "mike",
    "soccer12", "thomas2", "killer", "hannah", "amanda", "lovely",
    "nicole", "chelsea", "biteme", "matthew", "access", "yankees1",
    "987654", "dallas1", "austin", "thunder", "taylor", "matrix1",
    "minemine", "packers", "panther", "dakota", "eagles", "hammer1",
    "cheese", "coffee", "cookie", "chicken", "maverick", "falcon",
    "steelers", "eagles1", "merlin", "peanut", "phoenix", "sparky",
    "bigdog", "bigdaddy", "cobra", "london", "winner", "dolphin",
    "elephant", "family", "forever", "ferrari", "ginger1", "guitar",
    "hello1", "icecream", "jasmine", "jackson", "jersey", "johnny",
    "london1", "madrid", "miami", "monkey1", "morning", "mother",
    "mountain", "music", "nascar", "peanut1", "purple", "rainbow",
    "scooter", "soccer2", "special", "spongebob", "squirt", "steven",
    "tucker", "united", "victor", "wednesday", "william", "winner1",
    "yankee", "zxcvbnm", "asdfasdf", "abcd1234", "ab123456", "a1b2c3d4",
  ],

  // Service and infrastructure defaults.
  infrastructure: [
    "docker", "kubernetes", "k8s", "jenkins", "gitlab", "github", "bitbucket",
    "nginx", "apache", "tomcat", "postgres", "postgresql", "mysql", "mongodb",
    "redis", "rabbitmq", "kafka", "elasticsearch", "consul", "vault",
    "terraform", "ansible", "vagrant", "grafana", "prometheus", "keycloak",
    "auth0", "okta", "firebase", "cognito", "keycloak_secret",
    "insecure", "unsafe", "debug", "development", "production", "staging",
    "local", "localhost", "127.0.0.1", "0.0.0.0",
  ],

  // Identifiers that leak into JWT libraries as sample keys.
  samples: [
    "HS256", "HS384", "HS512", "RS256", "ES256", "JWT_SECRET", "ACCESS_TOKEN",
    "REFRESH_TOKEN", "AUTH_SECRET", "SECRET_KEY", "SIGNING_KEY", "COOKIE_SECRET",
    "SESSION_SECRET", "ENCRYPTION_KEY", "API_SECRET_KEY", "CLIENT_SECRET",
    "TOKEN_SECRET", "BEARER_SECRET", "OAUTH_SECRET", "HMAC_SECRET", "HMAC_KEY",
    "abcdefghijklmnop", "0123456789abcdef", "aaaaaaaaaaaaaaaa",
    "thequickbrownfox", "loremipsum", "foobar", "foobarbaz", "deadbeef",
  ],
};

export const SEED_GROUPS = Object.keys(DICTIONARY_SEEDS);

// Suffixes applied to every seed to model the mutations attackers actually try:
// "secret123", "Secret2024", "jwt_secret_key", and so on.
export const MUTATION_SUFFIXES = [
  "", "!", "@", "#", "$", "123", "1234", "12345", "123456", "01", "007", "0",
  "_", "-", ".", "_key", "_secret", "key", "secret", "_admin", "_api",
  "2020", "2021", "2022", "2023", "2024", "2025", "2026",
  "!", "!!", "@123", "#123", "!@#", "01!", "2024!", "2025!", "2026!",
  // Separated year forms: "secret_2024", "jwt-secret-2025", "key.2026"
  "_2020", "_2021", "_2022", "_2023", "_2024", "_2025", "_2026",
  "-2020", "-2021", "-2022", "-2023", "-2024", "-2025", "-2026",
  ".2024", ".2025", ".2026", "@2024", "@2025", "@2026",
  // Common "strong-ish" tails people append to look secure
  "_key123", "Key123", "_KEY", "Pass123", "pass123", "@1234", "123!",
];

const MUTATION_PREFIXES = ["", "my", "the", "jwt", "app", "api", "auth", "dev", "test", "super"];

// Base words that get multiplied by every suffix. Kept small so the generated
// set stays predictable in size.
const HIGH_VALUE_BASES = [
  "secret", "password", "admin", "jwt", "token", "key", "auth", "app",
  "api", "test", "demo", "default", "changeme", "super", "qwerty", "letmein",
];

export function buildCandidateSecrets() {
  const all = new Set();
  const seeds = Object.values(DICTIONARY_SEEDS).flat();

  for (const seed of seeds) all.add(seed);

  for (const seed of seeds) {
    for (const suffix of MUTATION_SUFFIXES) all.add(seed + suffix);
  }

  for (const base of HIGH_VALUE_BASES) {
    for (const prefix of MUTATION_PREFIXES) {
      for (const suffix of MUTATION_SUFFIXES) all.add(prefix + base + suffix);
    }
    const capitalized = base.charAt(0).toUpperCase() + base.slice(1);
    for (const suffix of MUTATION_SUFFIXES) all.add(capitalized + suffix);
    all.add(base.toUpperCase());
    all.add(base.toUpperCase() + "123");
  }

  return [...all];
}

export const TOTAL_CANDIDATES = buildCandidateSecrets().length;