// GraphQL endpoint URL
const GRAPHQL_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/graphql` : 'http://localhost:4001/graphql';

/**
 * Generic GraphQL request function
 * @param query GraphQL query or mutation string
 * @param variables Variables for the query/mutation
 * @param skipAuth Whether to skip adding the auth token
 * @param accessToken Optional access token for authentication
 * @returns Promise with the response data
 */
export async function graphqlRequest<T = any>(
  query: string,
  variables: Record<string, any> = {},
  skipAuth: boolean = false,
  accessToken?: string | null
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Add Authorization header if we have an access token and we're not skipping auth
  if (accessToken && !skipAuth) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
    credentials: 'include', // Include cookies for refresh tokens if used
  });

  // Check if the response is ok before consuming the body
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  // Parse the response JSON
  const result = await response.json();

  // Handle GraphQL errors
  if (result.errors) {
    let errorMessage = 'Unknown GraphQL error';

    // Check if result.errors is an array
    if (Array.isArray(result.errors)) {
      errorMessage = result.errors.map((e: any) => e.message).join('\n');
    }
    // Check if it's an object with a message property
    else if (typeof result.errors === 'object' && result.errors !== null && 'message' in result.errors) {
      errorMessage = result.errors.message;
    }
    // Check if it's a string
    else if (typeof result.errors === 'string') {
      errorMessage = result.errors;
    }
    // Otherwise, try to stringify it
    else {
      try {
        errorMessage = JSON.stringify(result.errors);
      } catch (e) {
        // If stringify fails, use a generic error message
        errorMessage = 'Unprocessable GraphQL error';
      }
    }

    throw new Error(`GraphQL Error: ${errorMessage}`);
  }

  return result.data as T;
}

// GraphQL Queries and Mutations

export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      accessToken
      refreshToken
      user {
        id
        email
        name
        role
        createdAt
      }
    }
  }
`;

export const ME_QUERY = `
  query Me {
    me {
      id
      email
      name
      role
      createdAt
    }
  }
`;

export const USERS_QUERY = `
  query Users {
    usersQuery {
      id
      email
      name
      role
      createdAt
    }
  }
`;
