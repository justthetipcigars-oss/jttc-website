const BASE_URL = 'https://justthetipcigars.retail.lightspeed.app/api/2.0';

type Customer = {
  id: string;
  customer_code?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  loyalty_balance?: number;
  balance?: number;
  year_to_date?: number;
  created_at?: string;
  updated_at?: string;
};

export async function fetchAllCustomers(): Promise<Customer[]> {
  const token = process.env.LIGHTSPEED_API_TOKEN;
  const customers: Customer[] = [];
  let after: string | null = null;

  do {
    let url = `${BASE_URL}/customers?page_size=250`;
    if (after) url += `&after=${after}`;

    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Lightspeed API error: ${res.status} — ${body}`);
    }

    const data = await res.json();
    customers.push(...(data.data || []));
    after = data.data?.length === 250 ? data.version?.max : null;
  } while (after);

  return customers.filter(c => c.customer_code !== 'WALKIN' && c.first_name);
}
