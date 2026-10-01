import Markdown from 'react-markdown';

export default function ProjectDescription({ description }) {
  if (!description) return null;

  return (
    <section className="py-4">
      <div className="container">
        <div className="text-center" style={{ fontFamily: 'var(--font-heading)' }}>
          <Markdown>{description}</Markdown>
        </div>
      </div>
    </section>
  );
}
