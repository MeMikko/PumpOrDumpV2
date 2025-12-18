import ProfileCard from "@/app/components/ProfileCard";
import Typewriter from "@/app/components/Typewriter";
import { TAGLINES } from "@/content/taglines";

export default function ProfilePage() {
  return (
    <main className="pod-content">
      <h1 className="pixel-text text-lg text-center">Profile</h1>

      <Typewriter text={TAGLINES.profile} />

      <div className="pod-grid mt-6">
        <ProfileCard />
      </div>
    </main>
  );
}
