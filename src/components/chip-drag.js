// Shared helper for the drag-and-drop chip tasks (symbols task 3, instructions
// task 3). It lived in both pages as a copy, and a bug in it had to be fixed
// twice, so it is kept in one place now.

// Which chip the dragged one should be inserted before, from the pointer
// position. Returns null to mean "put it at the end of the zone".
//
// Vertical position only picks which visual line you are on; horizontal position
// alone decides the slot within it. Combining the two into one sort key does not
// work: any scale that keeps lines in order also makes a pixel of vertical
// wobble outweigh the whole horizontal axis, which leaves the front and back of
// the zone as the only reachable slots.
export function getInsertBeforeElement(zone, x, y) {
  const chips = [...zone.querySelectorAll(".chip:not(.dragging)")];
  if (chips.length === 0) return null;

  const placed = chips.map((chip) => ({ chip, box: chip.getBoundingClientRect() }));

  // Group into visual lines. Chips that have not wrapped yield a single line.
  const lines = [];
  for (const entry of placed) {
    const line = lines.find(
      (candidate) => Math.abs(candidate.top - entry.box.top) < entry.box.height / 2,
    );
    if (line) line.items.push(entry);
    else lines.push({ top: entry.box.top, items: [entry] });
  }

  // The line under the pointer, or the closest one when it is above or below
  // them all — so a drop anywhere in the zone still counts.
  let nearest = lines[0];
  let shortest = Infinity;
  for (const line of lines) {
    const { top, height } = line.items[0].box;
    const distance = Math.abs(y - (top + height / 2));
    if (distance < shortest) {
      shortest = distance;
      nearest = line;
    }
  }

  // First chip on that line whose middle lies past the pointer.
  for (const { chip, box } of nearest.items) {
    if (x < box.left + box.width / 2) return chip;
  }

  // Past the end of the line: fall through to whatever follows it in the zone.
  const lastOnLine = nearest.items[nearest.items.length - 1].chip;
  return chips[chips.indexOf(lastOnLine) + 1] ?? null;
}
