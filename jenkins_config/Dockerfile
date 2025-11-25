FROM jenkins/jenkins:lts

# Switch to root to install plugins and configure
USER root

# Install Docker and additional tools
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    gnupg \
    lsb-release \
    sudo \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && apt-get update \
    && apt-get install -y docker-ce-cli docker-buildx-plugin docker-compose-plugin \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Add jenkins user to docker group with correct GID for macOS Docker Desktop  
RUN groupadd -f docker && usermod -aG docker jenkins
# Also add permission workaround for macOS Docker Desktop
RUN echo "jenkins ALL=(ALL) NOPASSWD: /usr/bin/docker*" >> /etc/sudoers

# Copy plugins list and install
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

# Copy initial configuration
COPY jenkins.yaml /usr/share/jenkins/ref/jenkins.yaml
COPY secrets/ /usr/share/jenkins/ref/secrets/

# Set environment for configuration as code
ENV CASC_JENKINS_CONFIG=/usr/share/jenkins/ref/jenkins.yaml
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"

# Switch back to jenkins user
USER jenkins
