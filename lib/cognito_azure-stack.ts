import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CognitoConstruct } from './cognito.construct'
import { CfnOutput, CfnParameter } from 'aws-cdk-lib'

export class CognitoAzureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const callbackUrl = new CfnParameter(this, 'callbackUrl', {
      type: 'String',
    })

    const azureMetadataUrl = new CfnParameter(this, 'azureMetadataUrl', {
      type: 'String',
    })


    const cognito = new CognitoConstruct(this, {
      callbackUrls: [callbackUrl.valueAsString],
      azureSamlUrl: azureMetadataUrl.valueAsString,
    })

    new CfnOutput(this, 'cognitoPoolId', {
      value: cognito.pool.userPoolId,
    })
  }
}
