var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.CodeCodexBackend>("codecodexbackend");

builder.Build().Run();
