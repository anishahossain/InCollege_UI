// server/profileCodec.js

const RECORD_LENGTH = 1284;

// fixed field lengths from COBOL
const lengths = {
  username: 20,
  firstName: 20,
  lastName: 20,
  school: 50,
  major: 40,
  gradYear: 4,
  about: 200,
  expTitle: 30,
  expCompany: 40,
  expDates: 30,
  expDesc: 120,
  eduDegree: 30,
  eduSchool: 40,
  eduYears: 20,
};

function pad(str, length) {
  const s = (str ?? "").toString();
  if (s.length >= length) return s.slice(0, length);
  return s + " ".repeat(length - s.length);
}

// JSON -> fixed-width COBOL record line
function encodeProfile(profile) {
  const exps = profile.experiences ?? [];
  const edus = profile.education ?? [];

  const parts = [];

  parts.push(pad(profile.username, lengths.username));
  parts.push(pad(profile.firstName, lengths.firstName));
  parts.push(pad(profile.lastName, lengths.lastName));
  parts.push(pad(profile.school, lengths.school));
  parts.push(pad(profile.major, lengths.major));
  parts.push(pad(profile.gradYear, lengths.gradYear));
  parts.push(pad(profile.about, lengths.about));

  // 3 experiences
  for (let i = 0; i < 3; i++) {
    const e = exps[i] || {};
    parts.push(pad(e.title, lengths.expTitle));
    parts.push(pad(e.company, lengths.expCompany));
    parts.push(pad(e.dates, lengths.expDates));
    parts.push(pad(e.description, lengths.expDesc));
  }

  // 3 education entries
  for (let i = 0; i < 3; i++) {
    const ed = edus[i] || {};
    parts.push(pad(ed.degree, lengths.eduDegree));
    parts.push(pad(ed.school, lengths.eduSchool));
    parts.push(pad(ed.years, lengths.eduYears));
  }

  const record = parts.join("");
  if (record.length !== RECORD_LENGTH) {
    throw new Error(
      `Profile record has length ${record.length}, expected ${RECORD_LENGTH}`
    );
  }
  return record;
}

// COBOL record line -> JSON
function decodeProfile(line) {
  // ensure length
  const padded = line.padEnd(RECORD_LENGTH, " ").slice(0, RECORD_LENGTH);

  const slice = (start, length) =>
    padded.slice(start, start + length).trimEnd(); // keep leading spaces, trim trailing

  let pos = 0;
  const take = (len) => {
    const value = slice(pos, len);
    pos += len;
    return value;
  };

  const username = take(lengths.username);
  const firstName = take(lengths.firstName);
  const lastName = take(lengths.lastName);
  const school = take(lengths.school);
  const major = take(lengths.major);
  const gradYear = take(lengths.gradYear);
  const about = take(lengths.about);

  const experiences = [];
  for (let i = 0; i < 3; i++) {
    const title = take(lengths.expTitle);
    const company = take(lengths.expCompany);
    const dates = take(lengths.expDates);
    const description = take(lengths.expDesc);

    // if the whole block is blank, we can still include it as empty
    experiences.push({ title, company, dates, description });
  }

  const education = [];
  for (let i = 0; i < 3; i++) {
    const degree = take(lengths.eduDegree);
    const schoolEd = take(lengths.eduSchool);
    const years = take(lengths.eduYears);
    education.push({ degree, school: schoolEd, years });
  }

  return {
    username,
    firstName,
    lastName,
    school,
    major,
    gradYear,
    about,
    experiences,
    education,
  };
}

module.exports = {
  encodeProfile,
  decodeProfile,
  RECORD_LENGTH,
};
