const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

class S3Repository {
  /**
   * @readonly
   */
  #s3Client = new S3Client();

  /**
   * @readonly
   */
  #s3Bucket = "silp0";

  /**
   * @param {{
   *  key: string
   * }} params
   */
  async get({ key }) {
    try {
      const data = await this.#s3Client.send(
        new GetObjectCommand({
          Bucket: this.#s3Bucket,
          Key: key,
        })
      );

      return data.Body?.transformToString() ?? null;
    } catch (err) {
      if (err.Code === "NoSuchKey") {
        return null;
      }

      throw err;
    }
  }

  /**
   * @param {{
   *  key: string
   *  data: string
   * }} params
   */
  async put({ key, data }) {
    await this.#s3Client.send(
      new PutObjectCommand({
        Bucket: this.#s3Bucket,
        Key: key,
        Body: data,
        ContentType: "application/json",
      })
    );
  }
}

exports.S3Repository = S3Repository;
