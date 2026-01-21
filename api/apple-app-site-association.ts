export default function handler(_req: any, res: any) {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send({
    applinks: {
      apps: [],
      details: [
        {
          appID: "58D77G87LU.org.reactjs.native.example.HelloWorld--one",
          paths: ["/[0-9a-fA-F-]{36}"],
        },
      ],
    },
  });
}
