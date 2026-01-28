export default function handler(_req: any, res: any) {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send({
    applinks: {
      apps: [],
      details: [
        {
          appID: "48TB6ZZL5S.io.agora.app.builder.conferencing",
          paths: ["*", "/"],
        },
        {
          appID: "34FKK829T7.org.reactjs.native.example.test.Helloworld",
          paths: ["*", "/"],
        },
      ],
    },
  });
}
