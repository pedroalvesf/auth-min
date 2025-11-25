FROM jenkins/jenkins:lts

# Switch to root to install plugins and configure
USER root

# Install Docker and additional tools
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    gnupg \
    lsb-release \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && apt-get update \
    && apt-get install -y docker-ce-cli docker-buildx-plugin docker-compose-plugin \
    && rm -rf /var/lib/apt/lists/*

# Add jenkins user to docker group
RUN groupadd -f docker && usermod -aG docker jenkins

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
