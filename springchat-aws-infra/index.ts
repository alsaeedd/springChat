import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Load configuration
const config = new pulumi.Config();
const dbUsername = config.get("dbUsername") || "username";
const dbPassword = config.get("dbPassword") || "password";
const projectName = config.get("projectName") || "springchat";
const environment = config.get("environment") || "dev";

// Create a simple VPC with just public subnets
const vpc = new aws.ec2.Vpc(`${projectName}-vpc`, {
    cidrBlock: "10.0.0.0/16",
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags: {
        Name: `${projectName}-vpc-${environment}`,
    },
});

// Create public subnets in different availability zones (for RDS)
const publicSubnet1 = new aws.ec2.Subnet(`${projectName}-subnet-1`, {
    vpcId: vpc.id,
    cidrBlock: "10.0.1.0/24",
    mapPublicIpOnLaunch: true,
    availabilityZone: "us-east-1a", // Choose your region's AZ
    tags: {
        Name: `${projectName}-subnet-1-${environment}`,
    },
});

const publicSubnet2 = new aws.ec2.Subnet(`${projectName}-subnet-2`, {
    vpcId: vpc.id,
    cidrBlock: "10.0.2.0/24",
    mapPublicIpOnLaunch: true,
    availabilityZone: "us-east-1b", // Choose a different AZ in your region
    tags: {
        Name: `${projectName}-subnet-2-${environment}`,
    },
});

// Create internet gateway for the VPC
const internetGateway = new aws.ec2.InternetGateway(`${projectName}-igw`, {
    vpcId: vpc.id,
    tags: {
        Name: `${projectName}-igw-${environment}`,
    },
});

// Create a route table for the public subnets
const routeTable = new aws.ec2.RouteTable(`${projectName}-rt`, {
    vpcId: vpc.id,
    routes: [
        {
            cidrBlock: "0.0.0.0/0",
            gatewayId: internetGateway.id,
        },
    ],
    tags: {
        Name: `${projectName}-rt-${environment}`,
    },
});

// Associate the route table with the subnets
const routeTableAssociation1 = new aws.ec2.RouteTableAssociation(`${projectName}-rta-1`, {
    subnetId: publicSubnet1.id,
    routeTableId: routeTable.id,
});

const routeTableAssociation2 = new aws.ec2.RouteTableAssociation(`${projectName}-rta-2`, {
    subnetId: publicSubnet2.id,
    routeTableId: routeTable.id,
});

// Security group for the EC2 instance
const ec2SecurityGroup = new aws.ec2.SecurityGroup(`${projectName}-ec2-sg`, {
    vpcId: vpc.id,
    description: "Security group for the EC2 instance",
    ingress: [
        // SSH access
        {
            protocol: "tcp",
            fromPort: 22,
            toPort: 22,
            cidrBlocks: ["0.0.0.0/0"], // In prosction, restrict this to your IP
        },
        // Spring Boot app
        {
            protocol: "tcp",
            fromPort: 8080,
            toPort: 8080,
            cidrBlocks: ["0.0.0.0/0"],
        },
        // Keycloak
        {
            protocol: "tcp",
            fromPort: 9090,
            toPort: 9090,
            cidrBlocks: ["0.0.0.0/0"],
        },
         // WebSocket (regular)
         {
            protocol: "tcp",
            fromPort: 8080,
            toPort: 8080,
            cidrBlocks: ["0.0.0.0/0"],
        },
        // WebSocket (secure)
        {
            protocol: "tcp",
            fromPort: 8443,
            toPort: 8443, 
            cidrBlocks: ["0.0.0.0/0"],
        },
    ],
    egress: [
        {
            protocol: "-1",
            fromPort: 0,
            toPort: 0,
            cidrBlocks: ["0.0.0.0/0"],
        },
    ],
    tags: {
        Name: `${projectName}-ec2-sg-${environment}`,
    },
});

// Security group for RDS
const rdsSecurityGroup = new aws.ec2.SecurityGroup(`${projectName}-rds-sg`, {
    vpcId: vpc.id,
    description: "Security group for RDS",
    ingress: [
        // MySQL access from EC2
        {
            protocol: "tcp",
            fromPort: 3306,
            toPort: 3306,
            securityGroups: [ec2SecurityGroup.id],
        },
    ],
    tags: {
        Name: `${projectName}-rds-sg-${environment}`,
    },
});

// Create DB subnet group
const dbSubnetGroup = new aws.rds.SubnetGroup(`${projectName.toLowerCase()}-db-subnet-group`, {
    subnetIds: [publicSubnet1.id, publicSubnet2.id],
    tags: {
        Name: `${projectName}-db-subnet-group-${environment}`,
    },
});

// Create RDS instance (free tier)
const rdsInstance = new aws.rds.Instance(`${projectName}-db`, {
    allocatedStorage: 20,
    engine: "mysql",
    engineVersion: "8.0",
    instanceClass: "db.t3.micro", // Free tier eligible
    dbName: "springChat",
    username: dbUsername,
    password: dbPassword,
    parameterGroupName: "default.mysql8.0",
    skipFinalSnapshot: true,
    publiclyAccessible: true, // Allows direct access for development
    vpcSecurityGroupIds: [rdsSecurityGroup.id],
    dbSubnetGroupName: dbSubnetGroup.name,
    tags: {
        Name: `${projectName}-db-${environment}`,
    },
});

// Get the latest Amazon Linux 2 AMI
const ami = aws.ec2.getAmi({
    mostRecent: true,
    owners: ["amazon"],
    filters: [
        {
            name: "name",
            values: ["amzn2-ami-hvm-*-x86_64-gp2"],
        },
    ],
});

// Create EC2 instance for backend and Keycloak
const ec2Instance = new aws.ec2.Instance(`${projectName}-ec2`, {
    ami: ami.then(ami => ami.id),
    instanceType: "t2.micro", // Free tier eligible
    subnetId: publicSubnet1.id,
    vpcSecurityGroupIds: [ec2SecurityGroup.id],
    associatePublicIpAddress: true,
    keyName: "springChat-key-pair",
    userData: pulumi.all([rdsInstance.endpoint, dbUsername, dbPassword]).apply(([endpoint, username, password]) => 
    `#!/bin/bash
    # Install Docker and Docker Compose
    amazon-linux-extras install docker -y
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ec2-user
    curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    # Create docker-compose.yml
    mkdir -p /home/ec2-user/app
    cat > /home/ec2-user/app/docker-compose.yml << 'EOL'
    version: '3'

services:
  keycloak:
    container_name: keycloak-springChat
    image: quay.io/keycloak/keycloak:26.0.0
    ports:
      - 9090:8080
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      KC_DB: mysql
      KC_DB_URL: jdbc:mysql://\${DB_ENDPOINT}/keycloak
      KC_DB_USERNAME: \${DB_USERNAME}
      KC_DB_PASSWORD: \${DB_PASSWORD}
      KC_HTTPS_CERTIFICATE_FILE: /opt/keycloak/conf/cert.pem
      KC_HTTPS_CERTIFICATE_KEY_FILE: /opt/keycloak/conf/key.pem
      KC_HOSTNAME_URL: https://\${EC2_IP}:9090
    volumes:
      - ./certs:/opt/keycloak/conf
    command:
      - "start-dev"
    restart: unless-stopped
    networks:
      - springchat-network

  springchat-backend:
    container_name: springchat-backend
    image: your-dockerhub/springchat-backend:latest
    ports:
      - 8080:8080  # HTTP port for health checks
      - 8443:8443  # HTTPS port for secure connections
    environment:
      SPRING_PROFILES_ACTIVE: aws
      RDS_ENDPOINT: \${DB_ENDPOINT}
      DB_USERNAME: \${DB_USERNAME}
      DB_PASSWORD: \${DB_PASSWORD}
      EC2_IP: \${EC2_IP}
      SSL_KEYSTORE_PASSWORD: \${SSL_KEYSTORE_PASSWORD}
    volumes:
      - ./certs:/app/certs
      - ./uploads:/app/uploads
    depends_on:
      - keycloak
    restart: unless-stopped
    networks:
      - springchat-network

networks:
  springchat-network:
    driver: bridge
    EOL

    # Set permissions
    chown -R ec2-user:ec2-user /home/ec2-user/app

    # Start the containers
    cd /home/ec2-user/app
    docker-compose up -d
    `),
    tags: {
        Name: `${projectName}-ec2-${environment}`,
    },
});

// Create S3 bucket for frontend
const frontendBucket = new aws.s3.Bucket(`${projectName}-frontend`, {
    // acl: aws.s3.CannedAcl.PublicRead, // Make the bucket public for website hosting
    website: {
        indexDocument: "index.html",
        errorDocument: "index.html",
    },
    corsRules: [{
        allowedHeaders: ["*"],
        allowedMethods: ["GET", "HEAD"],
        allowedOrigins: ["*"], // Restrict this in production
        exposeHeaders: ["ETag"],
        maxAgeSeconds: 3000,
    }],
    tags: {
        Name: `${projectName}-frontend-${environment}`,
    },
});

const frontendBucketPublicAccessBlock = new aws.s3.BucketPublicAccessBlock(`${projectName}-frontend-public-access`, {
    bucket: frontendBucket.id,
    blockPublicAcls: false,
    blockPublicPolicy: false,
    ignorePublicAcls: false,
    restrictPublicBuckets: false,
});

//Bucket ownershup control for frontend bucket
const frontendBucketOwnershipControls = new aws.s3.BucketOwnershipControls(`${projectName}-frontend-ownership`, {
    bucket: frontendBucket.id,
    rule: {
        objectOwnership: "ObjectWriter", 
    }
})

// Create S3 bucket for file uploads
const uploadsBucket = new aws.s3.Bucket(`${projectName}-uploads`, {
    corsRules: [{
        allowedHeaders: ["*"],
        allowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
        allowedOrigins: ["*"], // Restrict this in production
        exposeHeaders: ["ETag"],
        maxAgeSeconds: 3000,
    }],
    tags: {
        Name: `${projectName}-uploads-${environment}`,
    },
});

// IAM user and policy for Spring Boot to access S3
const s3User = new aws.iam.User(`${projectName}-s3-user`, {
    tags: {
        Name: `${projectName}-s3-user-${environment}`,
    },
});

const s3AccessPolicy = new aws.iam.Policy(`${projectName}-s3-access-policy`, {
    policy: uploadsBucket.arn.apply(bucketArn => JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Action: [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket",
            ],
            Resource: [
                bucketArn,
                `${bucketArn}/*`,
            ],
        }],
    })),
});

const s3UserPolicyAttachment = new aws.iam.UserPolicyAttachment(`${projectName}-s3-user-policy-attachment`, {
    user: s3User.name,
    policyArn: s3AccessPolicy.arn,
});

const s3AccessKey = new aws.iam.AccessKey(`${projectName}-s3-access-key`, {
    user: s3User.name,
});

// Create a CloudFront distribution for the frontend
const frontendDistribution = new aws.cloudfront.Distribution(`${projectName}-cdn`, {
    origins: [{
        domainName: frontendBucket.websiteEndpoint,
        originId: frontendBucket.arn,
        customOriginConfig: {
            httpPort: 80,
            httpsPort: 443,
            originProtocolPolicy: "http-only",
            originSslProtocols: ["TLSv1.2"],
        },
    }],
    enabled: true,
    isIpv6Enabled: true,
    defaultRootObject: "index.html",
    defaultCacheBehavior: {
        allowedMethods: ["GET", "HEAD", "OPTIONS"],
        cachedMethods: ["GET", "HEAD"],
        targetOriginId: frontendBucket.arn,
        forwardedValues: {
            queryString: false,
            cookies: {
                forward: "none",
            },
        },
        viewerProtocolPolicy: "redirect-to-https",
        minTtl: 0,
        defaultTtl: 3600,
        maxTtl: 86400,
    },
    // Handle SPA routing
    customErrorResponses: [
        {
            errorCode: 403,
            responseCode: 200,
            responsePagePath: "/index.html",
        },
        {
            errorCode: 404,
            responseCode: 200,
            responsePagePath: "/index.html",
        },
    ],
    restrictions: {
        geoRestriction: {
            restrictionType: "none",
        },
    },
    viewerCertificate: {
        cloudfrontDefaultCertificate: true,
    },
    tags: {
        Name: `${projectName}-cdn-${environment}`,
    },
});

// Create a bucket policy to allow public access to the frontend bucket
const frontendBucketPolicy = new aws.s3.BucketPolicy(`${projectName}-frontend-policy`, {
    bucket: frontendBucket.id,
    policy: frontendBucket.arn.apply(arn => JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Sid: "PublicReadGetObject",
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`${arn}/*`],
        }],
    })),
}, { dependsOn: [frontendBucketPublicAccessBlock] });

// Exports
export const instancePublicIp = ec2Instance.publicIp;
export const rdsEndpoint = rdsInstance.endpoint;
export const frontendBucketWebsite = frontendBucket.websiteEndpoint;
export const frontendBucketName = frontendBucket.bucket;
export const cloudfrontDomain = frontendDistribution.domainName;
export const uploadsBucketName = uploadsBucket.bucket;
export const s3AccessKeyId = s3AccessKey.id;
export const s3SecretAccessKey = s3AccessKey.secret;
export const cloudfrontId = frontendDistribution.id;