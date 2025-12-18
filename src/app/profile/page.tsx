import ProfileCard from "@/app/components/ProfileCard";

export default function ProfilePage() {
  return (
    <main className="pod-content">
      <h1 className="pixel-text text-lg text-center mb-4">Your Profile</h1>

      <div className="pod-grid">
        <ProfileCard />
      </div>
    </main>
  );
}
