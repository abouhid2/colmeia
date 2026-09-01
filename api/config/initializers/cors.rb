# Allow the React app (Vite dev server by default) to call the API.
# Set CORS_ORIGINS to a comma-separated list in production.
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch("CORS_ORIGINS", "http://localhost:5173").split(",").map(&:strip)

    resource "/api/*",
      headers: :any,
      methods: %i[ get post put patch delete options head ]
  end
end
