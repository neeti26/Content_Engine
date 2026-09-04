import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#09090f' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/bg-purple.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover object-center opacity-40 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)' }} />
      <div className="relative z-10">
        <SignUp />
      </div>
    </div>
  );
}
