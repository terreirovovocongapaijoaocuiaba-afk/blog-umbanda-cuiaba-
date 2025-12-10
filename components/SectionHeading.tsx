import React from 'react';

interface Props {
  subtitle: string;
  title: string;
  centered?: boolean;
}

const SectionHeading: React.FC<Props> = ({ subtitle, title, centered = true }) => {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : 'text-left'}`}>
      <span className="text-umbanda-gold font-bold tracking-[0.2em] text-sm uppercase block mb-2">
        {subtitle}
      </span>
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-white relative inline-block pb-4">
        {title}
        <span className={`absolute bottom-0 h-1 bg-umbanda-red rounded-full ${centered ? 'left-1/2 -translate-x-1/2 w-16' : 'left-0 w-16'}`}></span>
      </h2>
    </div>
  );
};

export default SectionHeading;