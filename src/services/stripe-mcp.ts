import { STRIPE_TEST_MODE } from '../config/constants';

/**
 * Helper to determine which MCP server to use based on test mode
 */
export const getStripeServerName = () => {
  return STRIPE_TEST_MODE 
    ? 'github.com/stripe/agent-toolkit-mysticballs-test' 
    : 'github.com/stripe/agent-toolkit-mysticballs';
};

/**
 * Create a Stripe customer
 */
export const createCustomer = async (name: string, email?: string) => {
  const serverName = getStripeServerName();
  
  // This would be called from code that uses Claude's tools
  // In actual implementation, this would use the use_mcp_tool
  return {
    server_name: serverName,
    tool_name: 'create_customer',
    arguments: { name, email }
  };
};

/**
 * List Stripe customers
 */
export const listCustomers = async (limit?: number, email?: string) => {
  const serverName = getStripeServerName();
  
  return {
    server_name: serverName,
    tool_name: 'list_customers',
    arguments: { limit, email }
  };
};

/**
 * Create a Stripe product
 */
export const createProduct = async (name: string, description?: string) => {
  const serverName = getStripeServerName();
  
  return {
    server_name: serverName,
    tool_name: 'create_product',
    arguments: { name, description }
  };
};

/**
 * List Stripe products
 */
export const listProducts = async (limit?: number) => {
  const serverName = getStripeServerName();
  
  return {
    server_name: serverName,
    tool_name: 'list_products',
    arguments: { limit }
  };
};

/**
 * Create a Stripe price
 */
export const createPrice = async (product: string, unit_amount: number, currency: string) => {
  const serverName = getStripeServerName();
  
  return {
    server_name: serverName,
    tool_name: 'create_price',
    arguments: { product, unit_amount, currency }
  };
};

/**
 * List Stripe prices
 */
export const listPrices = async (product?: string, limit?: number) => {
  const serverName = getStripeServerName();
  
  return {
    server_name: serverName,
    tool_name: 'list_prices',
    arguments: { product, limit }
  };
};

/**
 * Create a Stripe payment link
 */
export const createPaymentLink = async (price: string, quantity: number) => {
  const serverName = getStripeServerName();
  
  return {
    server_name: serverName,
    tool_name: 'create_payment_link',
    arguments: { price, quantity }
  };
};

/**
 * Create a Stripe invoice
 */
export const createInvoice = async (customer: string, days_until_due?: number) => {
  const serverName = getStripeServerName();
  
  return {
    server_name: serverName,
    tool_name: 'create_invoice',
    arguments: { customer, days_until_due }
  };
};

/**
 * Create a Stripe invoice item
 */
export const createInvoiceItem = async (customer: string, price: string, invoice: string) => {
  const serverName = getStripeServerName();
  
  return {
    server_name: serverName,
    tool_name: 'create_invoice_item',
    arguments: { customer, price, invoice }
  };
};

/**
 * Finalize a Stripe invoice
 */
export const finalizeInvoice = async (invoice: string) => {
  const serverName = getStripeServerName();
  
  return {
    server_name: serverName,
    tool_name: 'finalize_invoice',
    arguments: { invoice }
  };
};

/**
 * Retrieve Stripe balance
 */
export const retrieveBalance = async () => {
  const serverName = getStripeServerName();
  
  return {
    server_name: serverName,
    tool_name: 'retrieve_balance',
    arguments: {}
  };
};

/**
 * Create a Stripe refund
 */
export const createRefund = async (payment_intent: string, amount?: number) => {
  const serverName = getStripeServerName();
  
  return {
    server_name: serverName,
    tool_name: 'create_refund',
    arguments: { payment_intent, amount }
  };
};

/**
 * List Stripe payment intents
 */
export const listPaymentIntents = async (customer?: string, limit?: number) => {
  const serverName = getStripeServerName();
  
  return {
    server_name: serverName,
    tool_name: 'list_payment_intents',
    arguments: { customer, limit }
  };
};

/**
 * Search Stripe documentation
 */
export const searchDocumentation = async (question: string, language?: string) => {
  const serverName = getStripeServerName();
  
  return {
    server_name: serverName,
    tool_name: 'search_documentation',
    arguments: { question, language }
  };
};
