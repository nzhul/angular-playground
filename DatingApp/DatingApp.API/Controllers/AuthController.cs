using System.Threading.Tasks;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
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
        public async Task<IActionResult> Register([FromBody]UserForRegistrationDto userForRegistrationDto)
        {
            // validate request

            userForRegistrationDto.Username = userForRegistrationDto.Username.ToLower();

            if (await _repository.UserExists(userForRegistrationDto.Username))
            {
                return BadRequest("Username is already taken");
            }

            var userToCreate = new User
            {
                Username = userForRegistrationDto.Username
            };

            var createUser = await _repository.Register(userToCreate, userForRegistrationDto.Password);

            return StatusCode(201);
        }
    }
}