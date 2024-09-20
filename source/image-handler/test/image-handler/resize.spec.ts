// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import S3 from "aws-sdk/clients/s3";
import sharp from "sharp";

import { ImageHandler } from "../../image-handler";
import { ImageEdits } from "../../lib";

const s3Client = new S3();

describe("resize", () => {
  const SHARP_ERROR = "The image size is invalid.";

  it("Should pass if resize width and height are provided as string number to the function", async () => {
    // Arrange
    const originalImage = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64"
    );
    const image = sharp(originalImage, { failOnError: false }).withMetadata();
    const edits: ImageEdits = { resize: { width: "99.1", height: "99.9" } };

    // Act
    const imageHandler = new ImageHandler(s3Client);
    const result = await imageHandler.applyEdits(image, edits, false);

    // Assert
    const resultBuffer = await result.toBuffer();
    const convertedImage = await sharp(originalImage, { failOnError: false })
      .withMetadata()
      .resize({ width: 99, height: 100 })
      .toBuffer();
    expect(resultBuffer).toEqual(convertedImage);
  });

  it("Should fail if resize width and height are to high as string number to the function", async () => {
    // Arrange
    const originalImage = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64"
    );
    const image = sharp(originalImage, { failOnError: false }).withMetadata();
    const edits: ImageEdits = { resize: { width: "5001", height: "5001" } };

    // Act
    const imageHandler = new ImageHandler(s3Client);

    try {
      await imageHandler.applyEdits(image, edits, false);
    } catch (error) {
      // Assert
      expect(error.message).toMatch(SHARP_ERROR);
    }
  });
});
