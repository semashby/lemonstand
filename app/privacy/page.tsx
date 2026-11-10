export const metadata = { title: "Privacy · Lemonstand" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto grid max-w-2xl gap-4">
      <h1 className="text-3xl font-black">Privacy</h1>
      <p>Lemonstand runs juice workshops in Nijmegen. This is what we do with your details.</p>
      <h2 className="text-xl font-bold">What we keep, and why</h2>
      <p>Your name, email, phone and any note you write, to run your booking. Your payment goes through Stripe: we never see your card. If you make an account, your password is stored as a hash, and your profile picture if you add one.</p>
      <h2 className="text-xl font-bold">Who else handles it</h2>
      <p>Supabase stores our database. Stripe takes payments. If you use the note helper, what you type goes to our AI provider.</p>
      <h2 className="text-xl font-bold">How long</h2>
      <p>Until you ask us to delete it. We keep what booking amounts and dates the tax rules require, without your name.</p>
      <h2 className="text-xl font-bold">Your rights</h2>
      <p>You can ask to see your data, correct it, or delete it. Email hello@lemonstand.test and we answer within a month. You can also complain to your data protection authority.</p>
    </article>
  );
}
