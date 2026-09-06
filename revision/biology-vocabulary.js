(() => {
  'use strict';

  if (typeof modules === 'undefined' || !modules.genetics?.lessons) return;

  function vocabBlock(title, terms) {
    return `
      <section class="source-box biology-vocab" style="margin-top:18px;">
        <strong>${title}</strong>
        <div class="concept-grid" style="margin-top:10px;">
          ${terms.map(([term, definition]) => `<div class="concept"><strong>${term}</strong><p>${definition}</p></div>`).join('')}
        </div>
      </section>`;
  }

  const additions = [
    {
      match: /variation/i,
      html: vocabBlock('Key terms', [
        ['Variation', 'Differences in the characteristics of individuals in a population.'],
        ['Genetic variation', 'Variation caused by differences in the genes or alleles inherited from parents.'],
        ['Environmental variation', 'Variation caused by the conditions in which an organism develops or lives.'],
        ['Continuous variation', 'Variation that can take any value within a range, such as height.'],
        ['Discontinuous variation', 'Variation that falls into distinct categories, such as blood group.']
      ])
    },
    {
      match: /dna/i,
      html: vocabBlock('Key terms', [
        ['DNA', 'The genetic material in cells. DNA is made of two strands forming a double helix.'],
        ['Genome', 'The entire genetic material of an organism.'],
        ['Chromosome', 'A long DNA structure found in the nucleus that carries many genes.'],
        ['Gene', 'A small section of DNA on a chromosome that contains the instructions for a particular protein.']
      ])
    },
    {
      match: /chromosome|gene|allele/i,
      html: vocabBlock('Key terms', [
        ['Chromosome', 'A long DNA structure found in the nucleus that carries many genes.'],
        ['Gene', 'A small section of DNA on a chromosome that contains the instructions for a particular protein.'],
        ['Allele', 'A different version of the same gene.'],
        ['Genotype', 'The combination of alleles an organism has for a gene or characteristic.'],
        ['Phenotype', 'The characteristic that is expressed as a result of the genotype and its interaction with the environment.']
      ])
    },
    {
      match: /inheritance|punnett/i,
      html: vocabBlock('Inheritance vocabulary', [
        ['Gamete', 'A sex cell, such as a sperm or egg cell, containing a single set of chromosomes.'],
        ['Dominant allele', 'An allele that is expressed in the phenotype when one or two copies are present.'],
        ['Recessive allele', 'An allele that is expressed in the phenotype only when two copies are present and no dominant allele is present.'],
        ['Homozygous', 'Having two identical alleles for a gene, for example TT or tt.'],
        ['Heterozygous', 'Having two different alleles for a gene, for example Tt.'],
        ['Genotype', 'The combination of alleles an organism has for a gene or characteristic.'],
        ['Phenotype', 'The characteristic that is expressed as a result of the genotype and its interaction with the environment.'],
        ['Carrier', 'A heterozygous individual who has a recessive allele for a condition but does not show the recessive phenotype.']
      ])
    },
    {
      match: /mutation/i,
      html: vocabBlock('Key terms', [
        ['Mutation', 'A change in DNA. Most mutations have no effect on phenotype, some affect phenotype, and a small number can be beneficial or harmful.'],
        ['Genetic variation', 'Differences between individuals caused by differences in their genetic material.'],
        ['Phenotype', 'The observable or measurable characteristic produced by genotype and the environment.']
      ])
    },
    {
      match: /natural selection|evolution/i,
      html: vocabBlock('Key terms', [
        ['Population', 'A group of organisms of the same species living in the same area.'],
        ['Species', 'A group of organisms that can interbreed to produce fertile offspring.'],
        ['Selection pressure', 'An environmental factor that affects which individuals are more likely to survive and reproduce.'],
        ['Natural selection', 'The process in which individuals with advantageous inherited characteristics are more likely to survive, reproduce and pass on their alleles.'],
        ['Evolution', 'A change in the inherited characteristics of a population over time through natural selection.']
      ])
    },
    {
      match: /adapt/i,
      html: vocabBlock('Key terms', [
        ['Adaptation', 'A feature that increases an organism’s chance of surviving and reproducing in its environment.'],
        ['Structural adaptation', 'A physical feature of an organism, such as body shape, colour or a specialised structure.'],
        ['Behavioural adaptation', 'A way an organism behaves that helps it survive or reproduce.'],
        ['Physiological adaptation', 'An internal process or body function that helps an organism survive or reproduce.']
      ])
    }
  ];

  modules.genetics.lessons.forEach(lesson => {
    const add = additions.find(item => item.match.test(lesson.title));
    if (!add || lesson.__biologyVocabularyAdded) return;
    const originalBody = lesson.body;
    lesson.body = () => `${originalBody()}${add.html}`;
    lesson.__biologyVocabularyAdded = true;
  });
})();