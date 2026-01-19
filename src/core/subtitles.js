const WORDS_PER_SECOND = 2.6;

const ROOM_TRANSCRIPTS = {
  room1: [
    "My current approach to engineering design focuses on understanding problems before attempting to solve them.",
    "Instead of following fixed procedures, I question assumptions, reason from first principles, simplify complexity, and learn through iteration.",
    "I am drawn to this kind of work because it turns uncertainty into clarity and ideas into meaningful impact.",
    "I value clarity over complexity, accessibility over exclusivity, and progress over perfection, and I strive to build solutions that are both technically effective and widely useful.",
  ],
  room2: [
    "I value questioning assumptions because I have learned that many perceived limitations are based on convention rather than evidence.",
    "When I wanted to build a quantitative trading platform, the common belief was that someone without institutional data or formal finance training could not succeed.",
    "Instead of accepting this, I treated it as a hypothesis to test.",
    "By studying market behavior and reframing the problem to focus on high-probability entry conditions, I built and evaluated my own system through disciplined backtesting.",
    "This experience taught me to approach problems with greater humility, recognize what I did not yet understand, and refine my goals rather than accept what is considered impossible.",
  ],
  room3: [
    "My work on CellScope reflected a shift in how I approach engineering.",
    "Guided by accessibility, I used software to turn simple images into clear, high-resolution results.",
    "Returning to first principles let me design the optical layout, CAD structure, and reconstruction pipeline.",
    "That process taught me to identify what truly limits progress rather than copy existing designs.",
    "I now focus on fundamental constraints - cost, accessibility, and usability - when approaching new problems.",
  ],
  room4: [
    "As CellScope evolved, I learned the importance of simplicity in engineering design.",
    "Early versions of the image-processing system kept adding correction steps to improve quality, but the system became slow, fragile, and difficult to understand.",
    "By stepping back and simplifying the core model, I focused on solving the root problem instead of stacking fixes.",
    "The result was a cleaner, faster system with fewer assumptions and fewer points of failure.",
    "This experience taught me that simplicity is not about doing less work, but about understanding a system deeply enough to remove what is unnecessary without losing what matters.",
  ],
  room5: [
    "Hackathons further shaped how I approach uncertainty and idea development in engineering design.",
    "During Hack the North, Canada's largest hackathon, my team explored four to five different project ideas before committing to an Augmented Reality pose reference tool for artists.",
    "Instead of waiting for a perfect idea, we treated each concept as a prototype - quickly building, testing, and discarding ideas based on real feedback.",
    "This taught me that progress comes from action, not hesitation.",
    "By moving quickly and learning through experimentation, we were able to identify what was technically feasible and genuinely useful.",
    "Once a clear direction emerged, we refined the system into a real-time pipeline with inverse kinematics, temporal filtering, and a scalable cloud backend.",
    "This experience reinforced my belief that speed and iteration are essential in engineering design.",
    "When paired with reflection, rapid development turns uncertainty into insight and allows ideas to evolve into practical solutions.",
  ],
  room6: [
    "Across these experiences, my understanding of engineering has shifted from focusing on outcomes to focusing on interpretation and growth.",
    "I now see design as a way of understanding constraints, trade-offs, and human needs, rather than simply producing technical solutions.",
    "While I still value speed and efficiency, I have learned the importance of reflection, clarity, and purposeful decision-making.",
    "Most importantly, these experiences have reshaped how I see myself - not just as someone who builds systems, but as someone who learns through uncertainty, questions assumptions, and uses engineering as a tool to create meaningful impact for others.",
  ],
};

let subtitleState = {
  currentRoomId: null,
  segments: [],
  activeIndex: -1,
  durationUsed: null,
  subtitleTextEl: null,
  getRoomAudioTime: null,
  getRoomAudioDuration: null,
};

export function initSubtitleSystem({
  subtitleTextEl,
  getRoomAudioTime,
  getRoomAudioDuration,
}) {
  subtitleState = {
    ...subtitleState,
    subtitleTextEl,
    getRoomAudioTime,
    getRoomAudioDuration,
  };
}

export function setActiveRoom(roomConfig) {
  if (!roomConfig) {
    return;
  }

  const { id } = roomConfig;
  const duration = subtitleState.getRoomAudioDuration?.(id);
  subtitleState.currentRoomId = id;
  subtitleState.segments = buildSegments(id, duration);
  subtitleState.activeIndex = -1;
  subtitleState.durationUsed = duration ?? null;
  updateSubtitleDisplay(-1);
}

export function updateSubtitles() {
  if (!subtitleState.currentRoomId || !subtitleState.segments.length) {
    return;
  }

  const latestDuration = subtitleState.getRoomAudioDuration?.(subtitleState.currentRoomId);
  if (
    latestDuration &&
    (!subtitleState.durationUsed || Math.abs(latestDuration - subtitleState.durationUsed) > 0.25)
  ) {
    subtitleState.segments = buildSegments(subtitleState.currentRoomId, latestDuration);
    subtitleState.durationUsed = latestDuration;
    subtitleState.activeIndex = -1;
  }

  const currentTime = Math.max(0, subtitleState.getRoomAudioTime?.() ?? 0);
  const newIndex = getActiveSegmentIndex(subtitleState.segments, currentTime);
  if (newIndex !== subtitleState.activeIndex) {
    updateSubtitleDisplay(newIndex);
  }
}

function buildSegments(roomId, duration) {
  const lines = ROOM_TRANSCRIPTS[roomId] ?? [];
  if (!lines.length) {
    return [];
  }

  const wordCounts = lines.map(countWords);
  const totalWords = wordCounts.reduce((sum, count) => sum + count, 0);
  const fallbackDuration = Math.max(lines.length * 2.4, totalWords / WORDS_PER_SECOND);
  const totalDuration = duration && duration > 0 ? duration : fallbackDuration;

  let cursor = 0;
  return lines.map((text, index) => {
    const share = totalWords > 0 ? wordCounts[index] / totalWords : 1 / lines.length;
    const segmentDuration = share * totalDuration;
    const start = cursor;
    const end = index === lines.length - 1 ? totalDuration : cursor + segmentDuration;
    cursor = end;
    return {
      text,
      start,
      end,
      element: null,
    };
  });
}

function updateSubtitleDisplay(activeIndex) {
  const segments = subtitleState.segments;
  subtitleState.activeIndex = activeIndex;
  const currentSegment = segments[activeIndex];

  if (subtitleState.subtitleTextEl) {
    subtitleState.subtitleTextEl.textContent = currentSegment?.text ?? "";
  }
}

function getActiveSegmentIndex(segments, currentTime) {
  if (!segments.length) {
    return -1;
  }

  const lastIndex = segments.length - 1;
  if (currentTime >= segments[lastIndex].end) {
    return -1;
  }

  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i];
    if (currentTime >= segment.start && currentTime < segment.end) {
      return i;
    }
  }

  return -1;
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
