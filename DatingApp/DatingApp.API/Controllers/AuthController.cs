using System.Threading.Tasks;
using DatingApp.API.Data;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.API.Controllers
{
    [Route("api/[controller]")]
    public class AuthController : Controller
    {
        private readonly IAuthRepository _repository;
        public AuthController(IAuthRepository repository)
        {
            this._repository = repository;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(string username, string password)
        {
            // validate request

            username = username.ToLower();

            if (await _repository.UserExists(username))
            {
                return BadRequest("Username is already taken");
            }

            var userToCreate = new User
            {
                Username = username
            };

            var createUser = await _repository.Register(userToCreate, password);

            return StatusCode(201);
        }
    }
}