# Use the official Node.js 20.12 base image
FROM node:20.12

# Use /app as the working directory
WORKDIR /app

# Copy only the root package.json and package-lock.json
COPY package.json package-lock.json ./

# Copy all workspace package.json files into a temporary build context
COPY apps/*/package.json /tmp/apps/
COPY packages/*/package.json /tmp/packages/

# Use a shell command to move package.json files to the correct directories
RUN for dir in $(find /tmp/apps -mindepth 1 -maxdepth 1 -type d); do \
      mkdir -p ./apps/$(basename $dir) && mv $dir/package.json ./apps/$(basename $dir)/; \
    done && \
    for dir in $(find /tmp/packages -mindepth 1 -maxdepth 1 -type d); do \
      mkdir -p ./packages/$(basename $dir) && mv $dir/package.json ./packages/$(basename $dir)/; \
    done

# Install dependencies for all workspaces
RUN npm install

# Now copy the rest of the project files
COPY . ./

# Expose the desired port (replace 5000 with your actual port)
EXPOSE 5000

# Command to run your application (adjust according to your project)
CMD [ "npm", "start" ]