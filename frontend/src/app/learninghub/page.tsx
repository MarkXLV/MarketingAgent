import BankingFinanceVideos from "./BankingFinanceVideos";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
  
      <BankingFinanceVideos />
    </div>
  );
}
