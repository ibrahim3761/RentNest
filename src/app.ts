import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import { authRoutes } from "./modules/auth/auth.route";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { categoriesRoutes } from "./modules/categoris/categories.route";
import { propertyRoutes } from "./modules/property/property.route";
import { landlordRoutes } from "./modules/landlord/landlord.route";
import { notFound } from "./middlewares/notFound";
import { rentalsRoutes } from "./modules/rentals/rentals.route";
import { reviewsRoutes } from "./modules/reviews/reviews.route";
const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes); 
app.use("/api/categories", categoriesRoutes); 
app.use("/api/properties", propertyRoutes);
app.use("/api/landlord", landlordRoutes);
app.use("/api/rentals", rentalsRoutes);
app.use("/api/reviews", reviewsRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use(notFound)
app.use(globalErrorHandler);

export default app;
