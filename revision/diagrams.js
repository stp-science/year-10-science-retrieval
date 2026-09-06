const BBC_VISUALS = {
  atom: {
    images: [
      {
        src: "https://bam.files.bbci.co.uk/bam/live/content/zyvwsrd/large",
        alt: "BBC Bitesize diagram of an atom showing the nucleus and electrons in shells"
      }
    ],
    caption: "Atomic structure",
    source: "https://www.bbc.co.uk/bitesize/guides/zwn8b82/revision/3"
  },
  shells: {
    images: [
      {
        src: "https://bam.files.bbci.co.uk/bam/live/content/zyvwsrd/large",
        alt: "BBC Bitesize atomic structure diagram showing electrons arranged around the nucleus"
      }
    ],
    caption: "Electrons occupy shells around the nucleus",
    source: "https://www.bbc.co.uk/bitesize/guides/zwn8b82/revision/3"
  },
  periodic: {
    images: [
      {
        src: "https://www.creative-chemistry.org.uk/wp-content/uploads/periodic-table-gcse.webp",
        alt: "GCSE periodic table using modern IUPAC group numbers 1 to 18"
      }
    ],
    caption: "Periodic table — NZ / IUPAC group numbering 1–18",
    source: "https://www.creative-chemistry.org.uk/gcse/periodic",
    credit: "Creative Chemistry GCSE"
  },
  ph: {
    images: [
      {
        src: "https://bam.files.bbci.co.uk/bam/live/content/zc8r7p3/large",
        alt: "BBC Bitesize pH scale showing universal indicator colours"
      }
    ],
    caption: "pH scale and universal indicator colours",
    source: "https://www.bbc.co.uk/bitesize/guides/zqd8b82/revision/1"
  },
  distancegraph: {
    images: [
      {
        src: "https://bam.files.bbci.co.uk/bam/live/content/ztjh4qt/large",
        alt: "BBC Bitesize distance-time graph"
      }
    ],
    caption: "Distance–time graph",
    source: "https://www.bbc.co.uk/bitesize/guides/zwc7pbk/revision/3"
  },
  speedgraph: {
    images: [
      {
        src: "https://bam.files.bbci.co.uk/bam/live/content/z8gwsrd/large",
        alt: "BBC Bitesize velocity-time graph"
      }
    ],
    caption: "Velocity–time graph",
    source: "https://www.bbc.co.uk/bitesize/guides/zwc7pbk/revision/4"
  },
  punnett: {
    images: [
      {
        src: "https://bam.files.bbci.co.uk/bam/live/content/zj9ccj6/large",
        alt: "BBC Bitesize genetic diagram showing a monohybrid cross"
      }
    ],
    caption: "Genetic diagram / monohybrid cross",
    source: "https://www.bbc.co.uk/bitesize/topics/zm9nng8/articles/zc8fwsg"
  },
  variation: {
    images: [
      {
        src: "https://bam.files.bbci.co.uk/bam/live/content/zc6g8p3/large",
        alt: "BBC Bitesize graph showing continuous variation"
      },
      {
        src: "https://bam.files.bbci.co.uk/bam/live/content/zysk2hv/large",
        alt: "BBC Bitesize graph showing discontinuous variation"
      }
    ],
    caption: "Continuous and discontinuous variation",
    source: "https://www.bbc.co.uk/bitesize/topics/zm9nng8/articles/z8h8nk7"
  }
};

const SUPPORT_VIDEOS = {
  shells: {
    id: "kvTzdD1eGUQ",
    title: "Electronic structure and electron shells",
    provider: "Cognito",
    desc: "Supports electron arrangement, outer-shell electrons and ion formation."
  },
  forceintro: {
    id: "i5PtaCJJFjw",
    title: "Newton's first and second laws",
    provider: "Cognito",
    desc: "Supports resultant force, balanced forces and acceleration."
  },
  newton: {
    id: "i5PtaCJJFjw",
    title: "Newton's first and second laws",
    provider: "Cognito",
    desc: "Matches the section on resultant force, mass and acceleration."
  },
  distancegraph: {
    id: "RM02SnuJ0MY",
    title: "Distance–time graphs",
    provider: "Cognito",
    desc: "Shows how to interpret gradients and calculate speed."
  },
  speedgraph: {
    id: "b0VKlpetP9A",
    title: "Velocity–time graphs",
    provider: "Cognito",
    desc: "Supports acceleration, constant speed and interpreting graph sections."
  },
  ph: {
    id: "Yrf3Z_TQu_k",
    title: "Acids, alkalis and the pH scale",
    provider: "Cognito",
    desc: "Supports pH, indicators, acids, alkalis and neutralisation."
  },
  neutralisation: {
    id: "vcxlISVJ6Os",
    title: "Neutralisation and reactions of acids",
    provider: "Cognito",
    desc: "Supports acid + base reactions and salt formation."
  },
  acidreactions: {
    id: "vcxlISVJ6Os",
    title: "Neutralisation and reactions of acids",
    provider: "Cognito",
    desc: "Supports reactions of acids with bases, metals and carbonates."
  },
  variation: {
    id: "4PtOgToaKP8",
    title: "Variation, natural selection and evolution",
    provider: "Cognito",
    desc: "Supports inherited variation, selection pressures and evolution."
  },
  selection: {
    id: "4PtOgToaKP8",
    title: "Variation, natural selection and evolution",
    provider: "Cognito",
    desc: "Matches the natural-selection sequence used in this section."
  },
  punnett: {
    id: "BtPo9F-nkho",
    title: "Punnett squares and genetic diagrams",
    provider: "Cognito",
    desc: "Supports predicting offspring genotypes and probabilities."
  }
};

const VIDEO_ALIASES = {
  "ihuCYM5hR_s": {
    id: "GTpo1nAZqFE",
    title: "Atomic structure, isotopes and electron shells",
    provider: "Cognito",
    desc: "Matches the atomic-structure content: protons, neutrons, electrons, atomic number and electron shells."
  }
};

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function videoCard(id, title, provider, desc) {
  const replacement = VIDEO_ALIASES[id];
  if (replacement) {
    ({ id, title, provider, desc } = replacement);
  }
  return `
    <section class="video-card embedded-video" aria-label="${esc(title)}">
      <div style="position:relative;width:100%;aspect-ratio:16/9;background:#0c1726;border-radius:14px;overflow:hidden;">
        <iframe
          src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}"
          title="${esc(title)}"
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          style="position:absolute;inset:0;width:100%;height:100%;border:0;"
        ></iframe>
      </div>
      <div class="video-copy">
        <strong>${esc(title)}</strong>
        <p><b>${esc(provider)}</b></p>
        <p>${esc(desc)}</p>
      </div>
    </section>`;
}

function sourceVisualCard(item) {
  const images = item.images.map(image => `
    <img
      loading="lazy"
      src="${image.src}"
      alt="${esc(image.alt)}"
      style="display:block;width:100%;height:auto;max-height:440px;object-fit:contain;background:#fff;border-radius:12px;"
    >`).join("");

  return `
    <figure class="visual-wrap bbc-visual" style="padding:14px;">
      <div style="display:grid;grid-template-columns:repeat(${item.images.length > 1 ? 2 : 1},minmax(0,1fr));gap:12px;">
        ${images}
      </div>
      <figcaption class="visual-caption" style="margin-top:10px;">
        <strong>${esc(item.caption)}</strong>
        <span> • ${esc(item.credit || 'BBC Bitesize GCSE')}</span>
        <a href="${item.source}" target="_blank" rel="noopener" style="margin-left:8px;">View source ↗</a>
      </figcaption>
    </figure>`;
}

function diagram(type) {
  const visual = BBC_VISUALS[type] ? sourceVisualCard(BBC_VISUALS[type]) : "";
  const support = SUPPORT_VIDEOS[type];
  const video = support
    ? videoCard(support.id, support.title, support.provider, support.desc)
    : "";

  // If there is no suitable sourced visual for this section, show no
  // substitute diagram rather than drawing our own.
  return visual + video;
}
