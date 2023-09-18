# install dependencies only when needed
FROM node:18-alpine3.15 AS deps
# check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
# move to working directory
WORKDIR /app
# copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./
# install dependencies
RUN yarn install --frozen-lockfile

# build the app with cache dependencies
FROM node:18-alpine3.15 AS builder
# move to working directory
WORKDIR /app
# copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
# copy all files to the working directory
COPY . .
# build the app
RUN yarn build

# production image, copy all the files and run next
FROM node:18-alpine3.15 AS runner
# set working directory
WORKDIR /usr/src/app
# copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./
# install production dependencies
RUN yarn install --prod
# copy dist folder from builder stage
COPY --from=builder /app/dist ./dist
# copy public folder from builder stage 
COPY --from=builder /app/public ./public
# run application
CMD [ "node","dist/main" ]