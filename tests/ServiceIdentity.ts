import { test, expect } from "vitest";
import { ServiceIdentity } from "../src/lib/ServiceIdentity";

test("ServiceDiscoveryIdentity#to_xml/1", () => {
    const id = new ServiceIdentity("Exodus 0.9.1", "client", undefined, "pc");
    const id_xml = id.to_xml();
    expect(id_xml.getName()).toBe("identity");
    expect(id_xml.attrs.category).toBe("client");
    expect(id_xml.attrs.type).toBe("pc");
    expect(id_xml.attrs.name).toBe("Exodus 0.9.1");
});
