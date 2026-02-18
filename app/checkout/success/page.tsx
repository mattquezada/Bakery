export default function SuccessPage({ searchParams }: any) {
  return (
    <main>
      <h1>Thank You!</h1>
      <p>Your payment is being processed.</p>
      <p>Order ID: {searchParams.order}</p>
    </main>
  );
}
