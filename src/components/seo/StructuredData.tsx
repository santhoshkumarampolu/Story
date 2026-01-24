// Structured data (JSON-LD) for SEO
export function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Story Studio",
    "url": "https://aistorystudio.com",
    "description": "AI-powered storytelling platform for creating stories, screenplays, and scripts in multiple languages",
    "applicationCategory": "Creative Writing Software",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free tier with 5,000 tokens/month"
    },
    "featureList": [
      "AI-powered story generation",
      "Screenplay writing with professional formatting",
      "Multi-language support (English, Hindi, Telugu, Tamil, Kannada, Malayalam)",
      "Character development tools",
      "Scene breakdown and storyboarding",
      "Export to PDF, Fountain, Final Draft formats"
    ],
    "creator": {
      "@type": "Organization",
      "name": "AI Story Studio"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function OrganizationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AI Story Studio",
    "url": "https://aistorystudio.com",
    "logo": "https://aistorystudio.com/logo.png",
    "sameAs": [
      "https://twitter.com/aistorystudio",
      "https://www.linkedin.com/company/aistorystudio"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "availableLanguage": ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam"]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function FAQStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is AI Story Studio?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "AI Story Studio is an AI-powered platform that helps you create stories, screenplays, and scripts. It guides you step-by-step from idea to finished script, with AI assistance at every stage."
        }
      },
      {
        "@type": "Question",
        "name": "Which languages does AI Story Studio support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "AI Story Studio supports 6 languages: English, Hindi, Telugu, Tamil, Kannada, and Malayalam. You can write and translate your content in any of these languages."
        }
      },
      {
        "@type": "Question",
        "name": "Is AI Story Studio free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! AI Story Studio offers a free tier with 50,000 tokens per month, which is enough to create several short films or stories. Pro plans are available for heavy users."
        }
      },
      {
        "@type": "Question",
        "name": "Can I export my screenplay to industry-standard formats?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can export your scripts to PDF, Fountain (.fountain), Final Draft (.fdx), and plain text formats - all industry-standard screenplay formats."
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BreadcrumbStructuredData({ items }: { items: { name: string; url: string }[] }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
