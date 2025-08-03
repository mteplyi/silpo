#!/bin/sh

(
  set -e

  PNPM_VERSION=$(pnpm -v)

  IMAGE_TAG=$(
    podman build --build-arg PNPM_VERSION=$PNPM_VERSION . |
      tee /dev/tty |
      tail -1
  )

  CONTAINER=$(
    podman create $IMAGE_TAG |
      tee /dev/tty
  )

  {
    mkdir -p dist
    podman cp $CONTAINER:/app/lambda.zip dist/lambda.zip
  } || true

  podman rm --force $CONTAINER >/dev/null
)
