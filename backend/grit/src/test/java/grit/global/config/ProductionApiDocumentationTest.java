package grit.global.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@TestPropertySource(
        locations = "classpath:application-prod.properties",
        properties = "OTEL_ENDPOINT=http://localhost:4318/v1/traces"
)
class ProductionApiDocumentationTest {
    @Autowired
    private WebApplicationContext context;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        // Deliberately omit security filters: a 401 must not mask a registered docs endpoint.
        mvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "/v3/api-docs", "/v3/api-docs.yaml", "/v3/api-docs/swagger-config",
            "/swagger-ui.html", "/swagger-ui/index.html"
    })
    void productionDoesNotServeDocumentation(String path) throws Exception {
        mvc.perform(get(path)).andExpect(status().isNotFound());
    }
}
