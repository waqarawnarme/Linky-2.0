import { GraphQLClient } from 'graphql-request';

// Lazy proxy so the module can be imported even when Hygraph env vars are not
// set (build-time prerendering, deploys without CMS, etc.). Errors only when
// you actually try to make a request — at which point any callsite that has
// its own try/catch can swallow it gracefully.
function buildClient(): GraphQLClient {
  const endpoint = process.env.HYGRAPH_ENDPOINT;
  const token = process.env.HYGRAPH_TOKEN;

  if (!endpoint) {
    throw new Error('HYGRAPH_ENDPOINT is not defined');
  }
  if (!token) {
    throw new Error('HYGRAPH_TOKEN is not defined');
  }

  return new GraphQLClient(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

let _client: GraphQLClient | null = null;

export const client = new Proxy({} as GraphQLClient, {
  get(_target, prop, receiver) {
    if (!_client) {
      _client = buildClient();
    }
    const value = Reflect.get(_client, prop, receiver);
    return typeof value === 'function' ? value.bind(_client) : value;
  },
});
