// Button linking to the sound chart with a set of sounds pre-highlighted.
//
// Sounds are named by their short id from src/data/sound-chart.json, where the
// group letter is v = vowel, d = diphthong, c = consonant. So the four sounds
// covered by the numbers page are ["c-3", "c-10", "c-11", "c-23"], and the chart
// picks them up from the `highlight` query parameter.
//
// Short ids are used instead of IPA symbols because they need no percent
// encoding, which keeps the link readable.

const SHORT_ID = /^[vdc]-\d+$/;

export function SoundChartLink({ ids = [], label = "Sound chart", anchorId } = {}) {
  // Only well-formed ids reach the href, so a typo can never inject markup.
  const safe = ids.filter((id) => SHORT_ID.test(id));

  if (import.meta.env.DEV) {
    const rejected = ids.filter((id) => !SHORT_ID.test(id));
    if (rejected.length) {
      console.warn(
        `SoundChartLink: ignoring malformed sound id(s): ${rejected.join(", ")}`,
      );
    }
  }

  const query = safe.length ? `?highlight=${safe.join(",")}` : "";
  const idAttr = anchorId ? ` id="${anchorId}"` : "";

  return `<a${idAttr} href="/sound-chart/${query}" class="btn btn-secondary">${label}</a>`;
}
