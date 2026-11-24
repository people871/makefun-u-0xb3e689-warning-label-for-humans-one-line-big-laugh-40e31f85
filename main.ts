// "Warning: Human" — the safety warning label that should come printed
// on every human being, for the make.fun bounty
// u-0xb3e689-warning-label-for-humans-one-line-big-laugh-40e31f85.
//
// The label: this human overheats when asked "are we there yet?", leaks
// while cutting onions, and powers down without warning at 9 p.m. It
// sounds like a real printed label — the WARNING header, the flat list
// of hazards, the rhythm of a caution sheet — and the comedy comes from
// the form it imitates: three ordinary human failures filed as product
// defects. The laugh lands in the last few words, where the judge's
// brief wants the turn, and every clause is a true thing about people
// in general, not random absurdity.
//
// The program writes that one line, and nothing else, to
// /output/entry.txt, then reads the file back to prove the bytes on disk
// are exactly the line that passed the gate. Node 22+, no dependencies,
// no network, the same bytes on every run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The label before the judge. 131 Unicode code points as written;
// the gate counts the file, so the trailing newline makes 132.
const LABEL =
  "WARNING: This human overheats when asked 'are we there yet?', leaks while cutting onions, and powers down without warning at 9 p.m.";

// The bounty gate: /output/entry.txt must be UTF-8 text of 1 to 160
// characters, not only white space, and the entry is one line. The
// gate counts the file as written, trailing newline included, so the
// label itself must stay at or below 159 characters.
const GATE = { minPoints: 1, maxPoints: 160 };

// A printed safety label opens with its header word in capitals,
// followed by a colon: WARNING, CAUTION, or DANGER. The header is the
// whole joke's frame — without it the line is a complaint, not a label.
const LABEL_HEADER = /^(WARNING|CAUTION|DANGER): /;

// Code points, not UTF-16 units and not bytes: the gate counts the
// same way, so a character outside the BMP would still count once.
function points(text: string): number {
  return [...text].length;
}

function main(): void {
  const problems: string[] = [];

  if (LABEL.includes("\n") || LABEL.includes("\r")) {
    problems.push("the entry must be a single line");
  }
  if (LABEL !== LABEL.trim()) {
    problems.push("the entry must not start or end with whitespace");
  }
  if (!LABEL_HEADER.test(LABEL)) {
    problems.push("the entry must open with a label header like WARNING:");
  }
  // A label with only one hazard is a fortune cookie, not a warning
  // label: it needs at least two defects joined in the list. Count the
  // list items by their separators — commas and the final "and" — and
  // require three segments, so a two-hazard label fails the check.
  const hazards = LABEL.split(/,| and /).length;
  if (hazards < 3) {
    problems.push("the entry must list at least two hazards");
  }

  const fileText = LABEL + "\n";
  if (fileText.trim().length === 0) {
    problems.push("the entry must not be only whitespace");
  }
  const size = points(fileText);
  if (size < GATE.minPoints || size > GATE.maxPoints) {
    problems.push(
      `entry must be ${GATE.minPoints}-${GATE.maxPoints} characters, got ${size}`,
    );
  }
  if (fileText.endsWith("\n\n")) {
    problems.push("the entry must end with exactly one newline");
  }

  if (problems.length > 0) {
    throw new Error(`entry rejected: ${problems.join("; ")}`);
  }

  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", fileText, "utf8");

  // Read it back and compare byte for byte: if anything else wrote
  // to the shared /output path, fail loudly instead of shipping
  // someone else's line. Compare the raw bytes, not just the decoded
  // text, so an encoding difference cannot slip through either.
  const onDisk = readFileSync("/output/entry.txt");
  const expected = Buffer.from(fileText, "utf8");
  if (!onDisk.equals(expected)) {
    throw new Error(
      `entry.txt on disk (${onDisk.length} bytes) is not the gated label (${expected.length} bytes)`,
    );
  }
}

main();
