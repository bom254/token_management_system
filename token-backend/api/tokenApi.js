import connectToDatabase from "../connection/mongo";

export default async function handler(req, res) {
    await connectToDatabase();

    if (req.method === "GET") {
        const tokens = await Token.find({});
        res.status(200).json(tokens);
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
import Token from "../schema/tokenSchema";