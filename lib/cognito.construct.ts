import { Construct } from 'constructs'
import {
  ProviderAttribute,
  UserPool,
  UserPoolDomain,
  UserPoolIdentityProviderSaml,
  UserPoolClient,
  OAuthScope,
  UserPoolClientIdentityProvider,
  UserPoolIdentityProviderSamlMetadata
} from 'aws-cdk-lib/aws-cognito'

export type CognitoConstructProps = {
  callbackUrls: string[]
  azureSamlUrl: string
}

export class CognitoConstruct extends Construct {
  readonly pool: UserPool
  readonly poolDomain: UserPoolDomain
  readonly azureIdentityProvider: UserPoolIdentityProviderSaml
  readonly client: UserPoolClient

  constructor(scope: Construct, props: CognitoConstructProps) {
    super(scope, 'cognito')

    const { callbackUrls, azureSamlUrl } = props

    this.pool = new UserPool(this, 'pool', {
      userPoolName: 'spark-poc',
      standardAttributes: {
        email: {
          mutable: true,
          required: true,
        },
        givenName: {
          mutable: true,
          required: true,
        },
        familyName: {
          mutable: true,
          required: true,
        }
      },
      autoVerify: {
        email: true,
      },
    })

    this.poolDomain = new UserPoolDomain(this, 'poolDomain', {
      userPool: this.pool,
      cognitoDomain: {
        domainPrefix: 'spark-poc',
      }
    })

    this.azureIdentityProvider = new UserPoolIdentityProviderSaml(this, 'azureIdentityProvider', {
      userPool: this.pool,
      name: 'AzureAD',
      metadata: UserPoolIdentityProviderSamlMetadata.url(azureSamlUrl),
      attributeMapping: {
        email: ProviderAttribute.other('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'),
        givenName: ProviderAttribute.other('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'),
        familyName: ProviderAttribute.other('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'),
      }
    })

    this.client = new UserPoolClient(this, 'web-client', {
      userPool: this.pool,
      generateSecret: false,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        callbackUrls: callbackUrls,
        scopes: [OAuthScope.EMAIL, OAuthScope.OPENID],
      },
      supportedIdentityProviders: [UserPoolClientIdentityProvider.custom(this.azureIdentityProvider.providerName), UserPoolClientIdentityProvider.COGNITO],
    })
  }
}
